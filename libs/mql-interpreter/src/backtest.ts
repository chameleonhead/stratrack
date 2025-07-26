import { compile, callFunction, Runtime, registerEnvBuiltins } from './index';
import type { PreprocessOptions } from './preprocess';
import type { BuiltinFunction } from './builtins';
import { Broker, Order } from './broker';
import { Account, AccountMetrics } from './account';
import { MarketData, Tick } from './market';
import { VirtualTerminal } from './terminal';
import { setTerminal } from './builtins/impl/common';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface BacktestSession {
  broker: Broker;
  account: Account;
}

/** Parse CSV formatted candle data. Each line should contain
 *  `time,open,high,low,close[,volume]` values.
 */
export function parseCsv(data: string): Candle[] {
  const lines = data.split(/\r?\n/).filter((l: string) => l.trim().length);
  const candles: Candle[] = [];
  for (const line of lines) {
    const [time, open, high, low, close, volume] = line.split(',');
    const candle: Candle = {
      time: Number(time),
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
    };
    if (volume !== undefined) candle.volume = Number(volume);
    candles.push(candle);
  }
  return candles;
}

/** Convert a sequence of ticks into candles. `timeframe` specifies the duration
 *  of each candle in the same units as tick timestamps. */
export function ticksToCandles(ticks: Tick[], timeframe: number): Candle[] {
  if (!ticks.length) return [];
  const sorted = [...ticks].sort((a, b) => a.time - b.time);
  const candles: Candle[] = [];
  const mid = (t: Tick) => (t.bid + t.ask) / 2;
  let start = Math.floor(sorted[0].time / timeframe) * timeframe;
  let open = mid(sorted[0]);
  let high = open;
  let low = open;
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    const price = mid(t);
    const bucket = Math.floor(t.time / timeframe) * timeframe;
    if (bucket !== start) {
      const prev = sorted[i - 1];
      candles.push({ time: start, open, high, low, close: mid(prev) });
      start = bucket;
      open = price;
      high = price;
      low = price;
    } else {
      if (price > high) high = price;
      if (price < low) low = price;
    }
  }
  const last = sorted[sorted.length - 1];
  candles.push({ time: start, open, high, low, close: mid(last) });
  return candles;
}

export interface BacktestOptions {
  entryPoint?: string;
  preprocessOptions?: PreprocessOptions;
  initialBalance?: number;
  /** Tick data for each tradable symbol */
  ticks?: Record<string, Tick[]>;
  /** Primary symbol for this backtest */
  symbol?: string;
}

export class BacktestRunner {
  private runtime: Runtime;
  private index = 0;
  private session: BacktestSession;
  private market: MarketData;
  private terminal: VirtualTerminal;
  private selectedOrder?: Order;
  private initialized = false;
  private deinitialized = false;
  constructor(
    private source: string,
    private candles: Candle[],
    private options: BacktestOptions = {},
  ) {
    const compilation = compile(source, options.preprocessOptions);
    if (compilation.errors.length) {
      const msg = compilation.errors.map((e) => `${e.line}:${e.column} ${e.message}`).join('\n');
      throw new Error(`Compilation failed:\n${msg}`);
    }
    this.runtime = compilation.runtime;
    const broker = new Broker();
    const account = new Account(options.initialBalance ?? 0);
    this.session = { broker, account };
    this.terminal = new VirtualTerminal();
    setTerminal(this.terminal);
    const symbol = options.symbol ?? 'TEST';
    const baseTicks = candles.map(c => ({ time: c.time, bid: c.close, ask: c.close }));
    const ticks: Record<string, Tick[]> = { [symbol]: baseTicks, ...(options.ticks ?? {}) };
    this.market = new MarketData(ticks);
    this.initializeGlobals();
    const builtins = this.buildBuiltins();
    registerEnvBuiltins(builtins);
  }

  private initializeGlobals(): void {
    const rt = this.runtime.globalValues;
    rt.Open = this.candles.map(c => c.open);
    rt.High = this.candles.map(c => c.high);
    rt.Low = this.candles.map(c => c.low);
    rt.Close = this.candles.map(c => c.close);
    rt.Time = this.candles.map(c => c.time);
    rt.Volume = this.candles.map(c => c.volume ?? 0);
    rt.Bars = this.candles.length;
    rt.Digits = rt._Digits = 5;
    rt.Point = rt._Point = Math.pow(10, -5);
    const symbol = this.options.symbol ?? 'TEST';
    const tick = this.market.getTick(symbol, this.candles[0]?.time ?? 0);
    rt.Bid = tick?.bid ?? 0;
    rt.Ask = tick?.ask ?? 0;
    rt._Symbol = symbol;
    if (this.candles.length > 1) {
      rt._Period = this.candles[1].time - this.candles[0].time;
    }
  }

  private buildBuiltins(): Record<string, BuiltinFunction> {
    const metrics = () =>
      this.session.account.getMetrics(
        this.session.broker,
        this.runtime.globalValues.Bid,
        this.runtime.globalValues.Ask,
      );

    const marketInfo = (symbol: string, type: number): number => {
      const time = this.candles[Math.min(this.index, this.candles.length - 1)].time;
      const tick = this.market.getTick(symbol, time);
      switch (type) {
        case 9: // MODE_BID
          return tick?.bid ?? 0;
        case 10: // MODE_ASK
          return tick?.ask ?? 0;
        case 11: // MODE_POINT
          return this.runtime.globalValues.Point;
        case 12: // MODE_DIGITS
          return this.runtime.globalValues.Digits;
        case 13: // MODE_SPREAD
          return tick ? Math.round((tick.ask - tick.bid) / this.runtime.globalValues.Point) : 0;
        default:
          return 0;
      }
    };

    return {
      Bars: (_symbol: any, _tf: any) => this.candles.length,
      iBars: (_symbol: any, _tf: any) => this.candles.length,
      iBarShift: (_symbol: any, _tf: any, time: number, exact?: boolean) => {
        for (let i = 0; i < this.candles.length; i++) {
          const c = this.candles[i];
          const next = this.candles[i + 1];
          if (c.time === time) return i;
          if (!exact && next && c.time < time && time < next.time) return i;
        }
        return -1;
      },
      iOpen: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.open : 0;
      },
      iHigh: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.high : 0;
      },
      iLow: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.low : 0;
      },
      iClose: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.close : 0;
      },
      iTime: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.time : 0;
      },
      iVolume: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.volume ?? 0 : 0;
      },
      CopyTime: (_symbol: any, _tf: any, start: number, count: number, dst: number[]) => {
        for (let i = 0; i < count && start + i < this.candles.length; i++) {
          dst[i] = this.candles[start + i].time;
        }
        return Math.min(count, this.candles.length - start);
      },
      CopyOpen: (_symbol: any, _tf: any, start: number, count: number, dst: number[]) => {
        for (let i = 0; i < count && start + i < this.candles.length; i++) {
          dst[i] = this.candles[start + i].open;
        }
        return Math.min(count, this.candles.length - start);
      },
      CopyHigh: (_symbol: any, _tf: any, start: number, count: number, dst: number[]) => {
        for (let i = 0; i < count && start + i < this.candles.length; i++) {
          dst[i] = this.candles[start + i].high;
        }
        return Math.min(count, this.candles.length - start);
      },
      CopyLow: (_symbol: any, _tf: any, start: number, count: number, dst: number[]) => {
        for (let i = 0; i < count && start + i < this.candles.length; i++) {
          dst[i] = this.candles[start + i].low;
        }
        return Math.min(count, this.candles.length - start);
      },
      CopyClose: (_symbol: any, _tf: any, start: number, count: number, dst: number[]) => {
        for (let i = 0; i < count && start + i < this.candles.length; i++) {
          dst[i] = this.candles[start + i].close;
        }
        return Math.min(count, this.candles.length - start);
      },
      CopyTickVolume: (_symbol: any, _tf: any, start: number, count: number, dst: number[]) => {
        for (let i = 0; i < count && start + i < this.candles.length; i++) {
          dst[i] = this.candles[start + i].volume ?? 0;
        }
        return Math.min(count, this.candles.length - start);
      },
      CopyRates: (_symbol: any, _tf: any, start: number, count: number, dst: any[]) => {
        for (let i = 0; i < count && start + i < this.candles.length; i++) {
          const c = this.candles[start + i];
          dst[i] = { open: c.open, high: c.high, low: c.low, close: c.close, tick_volume: c.volume ?? 0, time: c.time };
        }
        return Math.min(count, this.candles.length - start);
      },
      SeriesInfoInteger: (_symbol: any, _tf: any, prop: number) => {
        if (prop === 0) return this.candles.length;
        return 0;
      },
      RefreshRates: () => 1,
      ResetLastError: () => {
        this.runtime.globalValues._LastError = 0;
        return 0;
      },
      iMA: (_symbol: any, _tf: any, period: number, maShift: number, _maMethod: number, applied: number, shift: number) => {
        const idx = this.index - (shift ?? 0) - maShift;
        if (idx < period - 1) return 0;
        const start = idx - period + 1;
        const slice = this.candles.slice(start, idx + 1);
        const val = (c: Candle) => {
          switch (applied) {
            case 1: return c.open;
            case 2: return c.high;
            case 3: return c.low;
            case 4: return (c.high + c.low) / 2;
            case 5: return (c.high + c.low + c.close) / 3;
            case 6: return (c.high + c.low + 2 * c.close) / 4;
            default: return c.close;
          }
        };
        const sum = slice.reduce((s, c) => s + val(c), 0);
        return sum / slice.length;
      },
      iMACD: (_symbol: any, _tf: any, fast: number, slow: number, signal: number, applied: number, mode: number, shift: number) => {
        const idx = this.index - (shift ?? 0);
        if (idx < Math.max(fast, slow)) return 0;
        const val = (c: Candle) => {
          switch (applied) {
            case 1: return c.open;
            case 2: return c.high;
            case 3: return c.low;
            case 4: return (c.high + c.low) / 2;
            case 5: return (c.high + c.low + c.close) / 3;
            case 6: return (c.high + c.low + 2 * c.close) / 4;
            default: return c.close;
          }
        };
        const kFast = 2 / (fast + 1);
        const kSlow = 2 / (slow + 1);
        const kSig = 2 / (signal + 1);
        let emaFast = val(this.candles[0]);
        let emaSlow = val(this.candles[0]);
        const macdVals: number[] = [emaFast - emaSlow];
        for (let i = 1; i <= idx; i++) {
          const price = val(this.candles[i]);
          emaFast = price * kFast + emaFast * (1 - kFast);
          emaSlow = price * kSlow + emaSlow * (1 - kSlow);
          macdVals.push(emaFast - emaSlow);
        }
        let sig = macdVals[0];
        for (let i = 1; i < macdVals.length; i++) {
          sig = macdVals[i] * kSig + sig * (1 - kSig);
        }
        const macd = macdVals[macdVals.length - 1];
        return mode === 1 ? sig : macd;
      },
      iRSI: (_symbol: any, _tf: any, period: number, applied: number, shift: number) => {
        const idx = this.index - (shift ?? 0);
        if (idx < period) return 0;
        const val = (c: Candle) => {
          switch (applied) {
            case 1: return c.open;
            case 2: return c.high;
            case 3: return c.low;
            case 4: return (c.high + c.low) / 2;
            case 5: return (c.high + c.low + c.close) / 3;
            case 6: return (c.high + c.low + 2 * c.close) / 4;
            default: return c.close;
          }
        };
        let gains = 0;
        let losses = 0;
        for (let i = idx - period + 1; i <= idx; i++) {
          const cur = val(this.candles[i]);
          const prev = val(this.candles[i - 1]);
          const diff = cur - prev;
          if (diff > 0) gains += diff; else losses -= diff;
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) return 100;
        if (avgGain === 0) return 0;
        const rs = avgGain / avgLoss;
        return 100 - 100 / (1 + rs);
      },
      GetLastError: () => this.runtime.globalValues._LastError,
      IsStopped: () => this.runtime.globalValues._StopFlag,
      Symbol: () => this.runtime.globalValues._Symbol,
      Period: () => this.runtime.globalValues._Period,
      PeriodSeconds: () => this.runtime.globalValues._Period,
      IsTesting: () => true,
      IsOptimization: () => false,
      IsConnected: () => true,
      TerminalInfoInteger: (prop: number) => {
        // basic subset: TERMINAL_CONNECTED = 7
        if (prop === 7) return 1;
        return 0;
      },
      OrderSend: (
        symbol: string,
        cmd: number,
        volume: number,
        price: number,
        slippage: number,
        sl: number,
        tp: number,
      ) => {
        return this.session.broker.sendOrder({
          symbol,
          cmd,
          volume,
          price,
          sl,
          tp,
          time: this.candles[this.index].time,
          bid: this.runtime.globalValues.Bid,
          ask: this.runtime.globalValues.Ask,
        });
      },
      MarketInfo: (sym: string, type: number) => marketInfo(sym, type),
      SymbolsTotal: (selected = false) =>
        this.market.getSymbols(Boolean(selected)).length,
      SymbolName: (index: number, selected = false) => {
        const list = this.market.getSymbols(Boolean(selected));
        return list[index] ?? '';
      },
      SymbolSelect: (sym: string, enable: boolean) => this.market.select(sym, enable),
      OrdersTotal: () => this.session.broker.getActiveOrders().length,
      OrdersHistoryTotal: () => this.session.broker.getHistory().length,
      OrderSelect: (index: number, select: number, pool = 0) => {
        const byTicket = select === 1;
        const arr = pool === 1 ? this.session.broker.getHistory() : this.session.broker.getActiveOrders();
        this.selectedOrder = byTicket ? this.session.broker.getOrder(index) : arr[index];
        return this.selectedOrder ? 1 : 0;
      },
      OrderType: () => (this.selectedOrder ? (this.selectedOrder.type === 'buy' ? 0 : 1) : -1),
      OrderTicket: () => (this.selectedOrder ? this.selectedOrder.ticket : -1),
      OrderSymbol: () => this.selectedOrder?.symbol ?? '',
      OrderLots: () => this.selectedOrder?.volume ?? 0,
      OrderOpenPrice: () => this.selectedOrder?.price ?? 0,
      OrderOpenTime: () => this.selectedOrder?.openTime ?? 0,
      OrderClosePrice: () => this.selectedOrder?.closePrice ?? 0,
      OrderCloseTime: () => this.selectedOrder?.closeTime ?? 0,
      OrderProfit: () => this.selectedOrder?.profit ?? 0,
      OrderClose: (ticket: number, lots: number, price: number) => {
        const t = ticket >= 0 ? ticket : this.selectedOrder?.ticket ?? -1;
        if (t < 0) return 0;
        const p = price > 0 ? price : this.runtime.globalValues.Bid;
        const pr = this.session.broker.close(t, p, this.candles[this.index].time);
        if (pr) this.session.account.applyProfit(pr);
        return pr ? 1 : 0;
      },
      AccountBalance: () => metrics().balance,
      AccountEquity: () => metrics().equity,
      AccountProfit: () => metrics().openProfit + metrics().closedProfit,
      AccountFreeMargin: () => metrics().equity,
      AccountCredit: () => 0,
      AccountCompany: () => 'Backtest',
      AccountCurrency: () => 'USD',
      AccountLeverage: () => 1,
      AccountMargin: () => 0,
      AccountName: () => 'Backtest',
      AccountNumber: () => 1,
      AccountServer: () => 'Backtest',
      AccountFreeMarginCheck: () => metrics().equity,
      AccountFreeMarginMode: () => 0,
      AccountStopoutLevel: () => 0,
      AccountStopoutMode: () => 0,
    };
  }
  private callInit(): void {
    if (!this.initialized && this.runtime.functions["OnInit"]) {
      try { callFunction(this.runtime, "OnInit"); } catch {}
    }
    this.initialized = true;
  }

  private callDeinit(): void {
    if (!this.deinitialized && this.runtime.functions["OnDeinit"]) {
      try { callFunction(this.runtime, "OnDeinit"); } catch {}
    }
    this.deinitialized = true;
  }


  step(): void {
    const entry = this.options.entryPoint || 'OnTick';
    this.callInit();
    if (this.index >= this.candles.length) return;
    const candle = this.candles[this.index];
    const symbol = this.options.symbol ?? 'TEST';
    const tick = this.market.getTick(symbol, candle.time);
    this.runtime.globalValues.Bid = tick?.bid ?? candle.close;
    this.runtime.globalValues.Ask = tick?.ask ?? candle.close;
    const profit = this.session.broker.update(candle);
    if (profit) {
      this.session.account.applyProfit(profit);
    }
    callFunction(this.runtime, entry);
    this.index++;
    if (this.index >= this.candles.length) this.callDeinit();
  }

  run(): void {
    this.callInit();
    while (this.index < this.candles.length) {
      this.step();
    }
    this.callDeinit();
  }

  getRuntime(): Runtime {
    return this.runtime;
  }

  getBroker(): Broker {
    return this.session.broker;
  }

  getAccountMetrics() {
    const bid = this.runtime.globalValues.Bid;
    const ask = this.runtime.globalValues.Ask;
    return this.session.account.getMetrics(this.session.broker, bid, ask);
  }

  getAccount(): Account {
    return this.session.account;
  }

  getMarketData(): MarketData {
    return this.market;
  }

  getTerminal(): VirtualTerminal {
    return this.terminal;
  }
}

