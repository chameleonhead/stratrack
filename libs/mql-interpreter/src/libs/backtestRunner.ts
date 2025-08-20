import { parse, ParseError } from "../parser/parser";
import { preprocessWithProperties, PreprocessOptions } from "../parser/preprocess";
import { execute, callFunction } from "../runtime/runtime";
import { semanticCheck } from "../semantic/checker";
import { builtinSignatures } from "./signatures";
import { registerEnvBuiltins } from "./functions";
import type { RuntimeState, ProgramType } from "../runtime/types";
import type { Declaration } from "../parser/ast";
import type { BuiltinFunction } from "./functions/types";
import { Broker, Order } from "./broker";
import { Account, AccountMetrics } from "./account";
import { MarketData } from "./marketData";
import type { Candle, Tick } from "./market.types";
import { VirtualTerminal, TerminalStorage } from "./virtualTerminal";
import { setContext, getContext } from "./functions/context";
import { IndicatorCache } from "./indicatorCache";

export interface BacktestSession {
  broker: Broker;
  account: Account;
}

/**
 * Parse CSV formatted candle data.
 *
 * Supported formats:
 *  - `timestamp,open,high,low,close[,volume]`
 *  - `date,time,open,high,low,close[,volume]` where date is `YYYY.MM.DD`
 *    and time is `HH:MM` (MetaTrader export)
 */
export function parseCsv(data: string): Candle[] {
  const lines = data.split(/\r?\n/).filter((l: string) => l.trim().length);
  const candles: Candle[] = [];
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length >= 7 && /\d{4}\.\d{2}\.\d{2}/.test(parts[0])) {
      // date,time,open,high,low,close[,volume]
      const [date, time, open, high, low, close, volume] = parts;
      const [year, month, day] = date.split(".").map(Number);
      const [hour, minute] = time.split(":").map(Number);
      const ts = Math.floor(new Date(year, month - 1, day, hour, minute).getTime() / 1000);
      const candle: Candle = {
        time: ts,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
      };
      if (volume !== undefined) candle.volume = Number(volume);
      candles.push(candle);
    } else {
      // timestamp,open,high,low,close[,volume]
      const [time, open, high, low, close, volume] = parts;
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
  }
  return candles;
}

export interface BacktestOptions {
  entryPoint?: string;
  preprocessOptions?: PreprocessOptions;
  initialBalance?: number;
  initialMargin?: number;
  accountCurrency?: string;
  /** Tick data for each tradable symbol */
  ticks?: Record<string, Tick[]>;
  /** Primary symbol for this backtest */
  symbol?: string;
  /** Storage backend for VirtualTerminal global variables */
  storage?: TerminalStorage;
  /** Values for variables declared with the `input` keyword */
  inputValues?: Record<string, any>;
  /** Callback for Print/Comment/Alert output */
  log?: (...args: any[]) => void;
  /** Default timeframe for the expert advisor in seconds */
  timeframe?: number;
}

export interface BacktestReport {
  globals: Record<string, any>;
  metrics: AccountMetrics;
  orders: Order[];
}

export class BacktestRunner {
  private runtime: RuntimeState;
  private index = 0;
  private session: BacktestSession;
  private market: MarketData;
  private terminal: VirtualTerminal;
  private selectedOrder?: Order;
  private initialized = false;
  private deinitialized = false;
  private pendingTradeEvents: Order[] = [];
  private indicators = new IndicatorCache();
  constructor(
    private source: string,
    private candles: Candle[],
    private options: BacktestOptions = {}
  ) {
    const {
      tokens,
      properties,
      errors: lexErrors,
    } = preprocessWithProperties(source, options.preprocessOptions);
    let ast: Declaration[] = [];
    let parseErr: { message: string; line: number; column: number } | null = null;
    if (lexErrors.length === 0) {
      try {
        ast = parse(tokens);
      } catch (err: any) {
        if (err instanceof ParseError) {
          parseErr = { message: err.message, line: err.line, column: err.column };
        } else {
          parseErr = { message: String(err), line: 0, column: 0 };
        }
      }
    }
    const runtime = execute(ast);
    runtime.properties = properties;
    let programType: ProgramType = "script";
    if (runtime.functions["OnCalculate"]) programType = "indicator";
    else if (runtime.functions["OnTick"]) programType = "expert";
    else if (runtime.functions["OnStart"]) programType = "script";
    runtime.programType = programType;
    const errors = [...lexErrors];
    if (parseErr) errors.push(parseErr);
    else errors.push(...semanticCheck(ast, builtinSignatures));
    if (errors.length) {
      const msg = errors.map((e) => `${e.line}:${e.column} ${e.message}`).join("\n");
      throw new Error(`Compilation failed:\n${msg}`);
    }
    this.runtime = runtime;
    if (options.inputValues) {
      for (const name in this.runtime.variables) {
        const info = this.runtime.variables[name];
        if (info.storage === "input" && options.inputValues[name] !== undefined) {
          this.runtime.globalValues[name] = options.inputValues[name];
        }
      }
    }
    const broker = new Broker();
    broker.onTrade((order) => {
      this.pendingTradeEvents.push(order);
    });
    const account = new Account(
      options.initialBalance ?? 10000,
      options.initialMargin ?? 0,
      options.accountCurrency ?? "USD"
    );
    this.session = { broker, account };
    this.terminal = new VirtualTerminal(options.storage, options.log);
    const symbol = options.symbol ?? "TEST";
    const dataPeriod = candles.length > 1 ? candles[1].time - candles[0].time : 0;
    const baseTicks = candles.map((c) => ({ time: c.time, bid: c.close, ask: c.close }));
    const ticks: Record<string, Tick[]> = { [symbol]: baseTicks, ...(options.ticks ?? {}) };
    const candleData = { [symbol]: { [dataPeriod]: candles } } as Record<
      string,
      Record<number, Candle[]>
    >;
    this.market = new MarketData(ticks, candleData);
    const period =
      options.timeframe ?? (candles.length > 1 ? candles[1].time - candles[0].time : 0);
    setContext({
      terminal: this.terminal,
      broker,
      account,
      market: this.market,
      symbol,
      timeframe: period,
      indicators: this.indicators,
    });
    this.initializeGlobals();
    const builtins = this.buildBuiltins();
    registerEnvBuiltins(builtins);
  }

  private initializeGlobals(): void {
    const rt = this.runtime.globalValues;
    rt.Open = this.candles.map((c) => c.open);
    rt.High = this.candles.map((c) => c.high);
    rt.Low = this.candles.map((c) => c.low);
    rt.Close = this.candles.map((c) => c.close);
    rt.Time = this.candles.map((c) => c.time);
    rt.Volume = this.candles.map((c) => c.volume ?? 0);
    rt.Bars = this.candles.length;
    rt.Digits = rt._Digits = 5;
    rt.Point = rt._Point = Math.pow(10, -5);
    const symbol = this.options.symbol ?? "TEST";
    const tick = this.market.getTick(symbol, this.candles[0]?.time ?? 0);
    rt.Bid = tick?.bid ?? 0;
    rt.Ask = tick?.ask ?? 0;
    rt._Symbol = symbol;
    const period =
      this.options.timeframe ??
      (this.candles.length > 1 ? this.candles[1].time - this.candles[0].time : 0);
    rt._Period = period;
  }

  private buildBuiltins(): Record<string, BuiltinFunction> {
    const metrics = () =>
      this.session.account.getMetrics(
        this.session.broker,
        this.runtime.globalValues.Bid,
        this.runtime.globalValues.Ask
      );

    const currentTime = () => this.candles[Math.min(this.index, this.candles.length - 1)].time;

    const candlesFor = (sym: any, tf: any): Candle[] => {
      const symbol = sym && String(sym).length ? String(sym) : (this.options.symbol ?? "TEST");
      const timeframe = Number(tf) || this.runtime.globalValues._Period;
      return this.market.getCandles(symbol, timeframe);
    };

    const findIndex = (candles: Candle[], time: number): number => {
      let lo = 0,
        hi = candles.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (candles[mid].time <= time) lo = mid + 1;
        else hi = mid - 1;
      }
      return hi;
    };

    const priceVal = (c: Candle, applied: number): number => {
      switch (applied) {
        case 1:
          return c.open;
        case 2:
          return c.high;
        case 3:
          return c.low;
        case 4:
          return (c.high + c.low) / 2;
        case 5:
          return (c.high + c.low + c.close) / 3;
        case 6:
          return (c.high + c.low + 2 * c.close) / 4;
        default:
          return c.close;
      }
    };

    const marketInfo = (symbol: string, type: number): number => {
      const time = currentTime();
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
      Bars: (sym: any, tf: any) => candlesFor(sym, tf).length,
      iBars: (sym: any, tf: any) => candlesFor(sym, tf).length,
      iBarShift: (sym: any, tf: any, time: number, exact?: boolean) => {
        const arr = candlesFor(sym, tf);
        for (let i = 0; i < arr.length; i++) {
          const c = arr[i];
          const next = arr[i + 1];
          if (c.time === time) return i;
          if (!exact && next && c.time < time && time < next.time) return i;
        }
        return -1;
      },
      iOpen: (sym: any, tf: any, shift: number) => {
        const arr = candlesFor(sym, tf);
        const idx = findIndex(arr, currentTime()) - (shift ?? 0);
        return arr[idx]?.open ?? 0;
      },
      iHigh: (sym: any, tf: any, shift: number) => {
        const arr = candlesFor(sym, tf);
        const idx = findIndex(arr, currentTime()) - (shift ?? 0);
        return arr[idx]?.high ?? 0;
      },
      iLow: (sym: any, tf: any, shift: number) => {
        const arr = candlesFor(sym, tf);
        const idx = findIndex(arr, currentTime()) - (shift ?? 0);
        return arr[idx]?.low ?? 0;
      },
      iClose: (sym: any, tf: any, shift: number) => {
        const arr = candlesFor(sym, tf);
        const idx = findIndex(arr, currentTime()) - (shift ?? 0);
        return arr[idx]?.close ?? 0;
      },
      iTime: (sym: any, tf: any, shift: number) => {
        const arr = candlesFor(sym, tf);
        const idx = findIndex(arr, currentTime()) - (shift ?? 0);
        return arr[idx]?.time ?? 0;
      },
      iVolume: (sym: any, tf: any, shift: number) => {
        const arr = candlesFor(sym, tf);
        const idx = findIndex(arr, currentTime()) - (shift ?? 0);
        return arr[idx]?.volume ?? 0;
      },
      CopyTime: (sym: any, tf: any, start: number, count: number, dst: number[]) => {
        const arr = candlesFor(sym, tf);
        for (let i = 0; i < count && start + i < arr.length; i++) dst[i] = arr[start + i].time;
        return Math.min(count, arr.length - start);
      },
      CopyOpen: (sym: any, tf: any, start: number, count: number, dst: number[]) => {
        const arr = candlesFor(sym, tf);
        for (let i = 0; i < count && start + i < arr.length; i++) dst[i] = arr[start + i].open;
        return Math.min(count, arr.length - start);
      },
      CopyHigh: (sym: any, tf: any, start: number, count: number, dst: number[]) => {
        const arr = candlesFor(sym, tf);
        for (let i = 0; i < count && start + i < arr.length; i++) dst[i] = arr[start + i].high;
        return Math.min(count, arr.length - start);
      },
      CopyLow: (sym: any, tf: any, start: number, count: number, dst: number[]) => {
        const arr = candlesFor(sym, tf);
        for (let i = 0; i < count && start + i < arr.length; i++) dst[i] = arr[start + i].low;
        return Math.min(count, arr.length - start);
      },
      CopyClose: (sym: any, tf: any, start: number, count: number, dst: number[]) => {
        const arr = candlesFor(sym, tf);
        for (let i = 0; i < count && start + i < arr.length; i++) dst[i] = arr[start + i].close;
        return Math.min(count, arr.length - start);
      },
      CopyTickVolume: (sym: any, tf: any, start: number, count: number, dst: number[]) => {
        const arr = candlesFor(sym, tf);
        for (let i = 0; i < count && start + i < arr.length; i++)
          dst[i] = arr[start + i].volume ?? 0;
        return Math.min(count, arr.length - start);
      },
      CopyRates: (sym: any, tf: any, start: number, count: number, dst: any[]) => {
        const arr = candlesFor(sym, tf);
        for (let i = 0; i < count && start + i < arr.length; i++) {
          const c = arr[start + i];
          dst[i] = {
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            tick_volume: c.volume ?? 0,
            time: c.time,
          };
        }
        return Math.min(count, arr.length - start);
      },
      SeriesInfoInteger: (sym: any, tf: any, prop: number) => {
        const arr = candlesFor(sym, tf);
        if (prop === 0) return arr.length;
        return 0;
      },
      RefreshRates: () => 1,
      ResetLastError: () => {
        this.runtime.globalValues._LastError = 0;
        return 0;
      },
      IndicatorBuffers: (count: number) => {
        this.runtime.globalValues._IndicatorBuffers = Array(count).fill(null);
        this.runtime.globalValues._IndicatorLabels = Array(count).fill("");
        this.runtime.globalValues._IndicatorShifts = Array(count).fill(0);
        return 0;
      },
      SetIndexBuffer: (index: number, arr: number[]) => {
        const buffs = this.runtime.globalValues._IndicatorBuffers;
        if (!Array.isArray(buffs) || index < 0 || index >= buffs.length) return false;
        buffs[index] = arr;
        return true;
      },
      SetIndexLabel: (index: number, text: string) => {
        const labels = this.runtime.globalValues._IndicatorLabels;
        if (!Array.isArray(labels) || index < 0 || index >= labels.length) return false;
        labels[index] = text;
        return true;
      },
      SetIndexShift: (index: number, shift: number) => {
        const shifts = this.runtime.globalValues._IndicatorShifts;
        if (!Array.isArray(shifts) || index < 0 || index >= shifts.length) return false;
        shifts[index] = shift;
        return true;
      },
      IndicatorCounted: () => this.runtime.globalValues._IndicatorCounted ?? 0,
      IndicatorDigits: () => this.runtime.globalValues.Digits,
      IndicatorSetDouble: (_prop: number, value: number) => {
        const props = (this.runtime.globalValues._IndicatorProps ??= {} as Record<number, unknown>);
        props[_prop] = value;
        return 0;
      },
      IndicatorSetInteger: (_prop: number, value: number) => {
        const props = (this.runtime.globalValues._IndicatorProps ??= {} as Record<number, unknown>);
        props[_prop] = value;
        return 0;
      },
      IndicatorSetString: (_prop: number, value: string) => {
        const props = (this.runtime.globalValues._IndicatorProps ??= {} as Record<number, unknown>);
        props[_prop] = value;
        return 0;
      },
      IndicatorShortName: (name: string) => {
        this.runtime.globalValues._IndicatorShortName = name;
        return 0;
      },
      iMA: (
        sym: any,
        tf: any,
        period: number,
        maShift: number,
        _maMethod: number,
        applied: number,
        shift: number
      ) => {
        const arr = candlesFor(sym, tf);
        const curIdx = findIndex(arr, currentTime());
        const cache = getContext().indicators!;
        const key = {
          type: "iMA",
          symbol: sym,
          timeframe: tf,
          params: { period, maMethod: _maMethod, applied },
        } as const;
        const ctx = cache.getOrCreate(key, () => ({
          last: -1,
          values: [] as number[],
          sum: 0,
        }));
        if (ctx.last < curIdx) {
          for (let i = ctx.last + 1; i <= curIdx; i++) {
            const price = priceVal(arr[i], applied);
            ctx.sum += price;
            if (i >= period) ctx.sum -= priceVal(arr[i - period], applied);
            ctx.values[i] = i >= period - 1 ? ctx.sum / period : 0;
            ctx.last = i;
          }
        }
        const idx = curIdx - (shift ?? 0) - maShift;
        return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
      },
      iMACD: (
        sym: any,
        tf: any,
        fast: number,
        slow: number,
        signal: number,
        applied: number,
        mode: number,
        shift: number
      ) => {
        const arr = candlesFor(sym, tf);
        const curIdx = findIndex(arr, currentTime());
        const cache = getContext().indicators!;
        const key = {
          type: "iMACD",
          symbol: sym,
          timeframe: tf,
          params: { fast, slow, signal, applied },
        } as const;
        const ctx = cache.getOrCreate(key, () => ({
          last: -1,
          macd: [] as number[],
          signal: [] as number[],
          hist: [] as number[],
          emaFast: 0,
          emaSlow: 0,
          sig: 0,
        }));
        const kFast = 2 / (fast + 1);
        const kSlow = 2 / (slow + 1);
        const kSig = 2 / (signal + 1);
        if (ctx.last < 0 && curIdx >= 0) {
          const price0 = priceVal(arr[0], applied);
          ctx.emaFast = price0;
          ctx.emaSlow = price0;
          ctx.sig = 0;
          ctx.macd[0] = 0;
          ctx.signal[0] = 0;
          ctx.hist[0] = 0;
          ctx.last = 0;
        }
        if (ctx.last < curIdx) {
          for (let i = ctx.last + 1; i <= curIdx; i++) {
            const price = priceVal(arr[i], applied);
            ctx.emaFast = price * kFast + ctx.emaFast * (1 - kFast);
            ctx.emaSlow = price * kSlow + ctx.emaSlow * (1 - kSlow);
            const macd = ctx.emaFast - ctx.emaSlow;
            ctx.sig = macd * kSig + ctx.sig * (1 - kSig);
            const ready = i >= Math.max(fast, slow);
            ctx.macd[i] = ready ? macd : 0;
            ctx.signal[i] = ready ? ctx.sig : 0;
            ctx.hist[i] = ready ? macd - ctx.sig : 0;
            ctx.last = i;
          }
        }
        const idx = curIdx - (shift ?? 0);
        if (idx < 0) return 0;
        if (mode === 1) return ctx.signal[idx] ?? 0;
        if (mode === 2) return ctx.hist[idx] ?? 0;
        return ctx.macd[idx] ?? 0;
      },
      iATR: (sym: any, tf: any, period: number, shift: number) => {
        const arr = candlesFor(sym, tf);
        const curIdx = findIndex(arr, currentTime());
        const cache = getContext().indicators!;
        const key = {
          type: "iATR",
          symbol: sym,
          timeframe: tf,
          params: { period },
        } as const;
        const ctx = cache.getOrCreate(key, () => ({
          last: -1,
          values: [] as number[],
          atr: 0,
          prevClose: 0,
        }));
        if (ctx.last < 0 && curIdx >= 0) {
          const first = arr[0];
          ctx.prevClose = first.close;
          ctx.values[0] = 0;
          ctx.last = 0;
        }
        if (ctx.last < curIdx) {
          for (let i = ctx.last + 1; i <= curIdx; i++) {
            const cur = arr[i];
            const tr = Math.max(
              cur.high - cur.low,
              Math.abs(cur.high - ctx.prevClose),
              Math.abs(cur.low - ctx.prevClose)
            );
            if (i <= period) {
              ctx.atr = (ctx.atr * (i - 1) + tr) / i;
            } else {
              ctx.atr = (ctx.atr * (period - 1) + tr) / period;
            }
            ctx.values[i] = ctx.atr;
            ctx.prevClose = cur.close;
            ctx.last = i;
          }
        }
        const idx = curIdx - (shift ?? 0);
        return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
      },
      iRSI: (sym: any, tf: any, period: number, applied: number, shift: number) => {
        const arr = candlesFor(sym, tf);
        const curIdx = findIndex(arr, currentTime());
        const cache = getContext().indicators!;
        const key = {
          type: "iRSI",
          symbol: sym,
          timeframe: tf,
          params: { period, applied },
        } as const;
        const ctx = cache.getOrCreate(key, () => ({
          last: -1,
          values: [] as number[],
          gains: [] as number[],
          losses: [] as number[],
        }));
        if (ctx.last < 0 && curIdx >= 0) {
          ctx.values[0] = 0;
          ctx.gains[0] = 0;
          ctx.losses[0] = 0;
          ctx.last = 0;
        }
        if (ctx.last < curIdx) {
          for (let i = ctx.last + 1; i <= curIdx; i++) {
            const price = priceVal(arr[i], applied);
            const prev = priceVal(arr[i - 1], applied);
            const diff = price - prev;
            ctx.gains[i] = diff > 0 ? diff : 0;
            ctx.losses[i] = diff < 0 ? -diff : 0;
            if (i < period) {
              ctx.values[i] = 0;
            } else {
              let gains = 0;
              let losses = 0;
              for (let j = i - period + 1; j <= i; j++) {
                gains += ctx.gains[j];
                losses += ctx.losses[j];
              }
              const avgGain = gains / period;
              const avgLoss = losses / period;
              if (avgLoss === 0) ctx.values[i] = 100;
              else if (avgGain === 0) ctx.values[i] = 0;
              else {
                const rs = avgGain / avgLoss;
                ctx.values[i] = 100 - 100 / (1 + rs);
              }
            }
            ctx.last = i;
          }
        }
        const idx = curIdx - (shift ?? 0);
        return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
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
        tp: number
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
      SymbolsTotal: (selected = false) => this.market.getSymbols(Boolean(selected)).length,
      SymbolName: (index: number, selected = false) => {
        const list = this.market.getSymbols(Boolean(selected));
        return list[index] ?? "";
      },
      SymbolSelect: (sym: string, enable: boolean) => this.market.select(sym, enable),
      OrdersTotal: () => this.session.broker.getActiveOrders().length,
      OrdersHistoryTotal: () => this.session.broker.getHistory().length,
      OrderSelect: (index: number, select: number, pool = 0) => {
        const byTicket = select === 1;
        const arr =
          pool === 1 ? this.session.broker.getHistory() : this.session.broker.getActiveOrders();
        this.selectedOrder = byTicket ? this.session.broker.getOrder(index) : arr[index];
        return this.selectedOrder ? 1 : 0;
      },
      OrderType: () => (this.selectedOrder ? (this.selectedOrder.type === "buy" ? 0 : 1) : -1),
      OrderTicket: () => (this.selectedOrder ? this.selectedOrder.ticket : -1),
      OrderSymbol: () => this.selectedOrder?.symbol ?? "",
      OrderLots: () => this.selectedOrder?.volume ?? 0,
      OrderOpenPrice: () => this.selectedOrder?.price ?? 0,
      OrderOpenTime: () => this.selectedOrder?.openTime ?? 0,
      OrderClosePrice: () => this.selectedOrder?.closePrice ?? 0,
      OrderCloseTime: () => this.selectedOrder?.closeTime ?? 0,
      OrderProfit: () => this.selectedOrder?.profit ?? 0,
      OrderClose: (
        ticket: number,
        lots: number,
        price: number,
        _slippage?: number,
        _arrowColor?: number
      ) => {
        const t = ticket >= 0 ? ticket : (this.selectedOrder?.ticket ?? -1);
        if (t < 0) return 0;
        const p = price > 0 ? price : this.runtime.globalValues.Bid;
        const pr = this.session.broker.close(t, p, this.candles[this.index].time);
        if (pr) this.session.account.applyProfit(pr);
        return pr ? 1 : 0;
      },
      OrderModify: (
        ticket: number,
        price: number,
        sl: number,
        tp: number,
        _expiration?: number,
        _arrowColor?: number
      ) => {
        const t = ticket >= 0 ? ticket : (this.selectedOrder?.ticket ?? -1);
        if (t < 0) return 0;
        const ok = this.session.broker.modify(t, price, sl, tp);
        if (ok && this.selectedOrder && this.selectedOrder.ticket === t) {
          this.selectedOrder = this.session.broker.getOrder(t);
        }
        return ok ? 1 : 0;
      },
      AccountBalance: () => metrics().balance,
      AccountEquity: () => metrics().equity,
      AccountProfit: () => metrics().openProfit + metrics().closedProfit,
      AccountFreeMargin: () => metrics().freeMargin,
      AccountCredit: () => 0,
      AccountCompany: () => "Backtest",
      AccountCurrency: () => this.session.account.getCurrency(),
      AccountLeverage: () => 1,
      AccountMargin: () => metrics().margin,
      AccountName: () => "Backtest",
      AccountNumber: () => 1,
      AccountServer: () => "Backtest",
      AccountFreeMarginCheck: () => metrics().equity,
      AccountFreeMarginMode: () => 0,
      AccountStopoutLevel: () => 0,
      AccountStopoutMode: () => 0,
    };
  }
  private callInit(): void {
    if (!this.initialized && this.runtime.functions["OnInit"]) {
      try {
        callFunction(this.runtime, "OnInit");
      } catch (_err) {
        void _err;
        // ignore initialization errors
      }
    }
    this.initialized = true;
  }

  private callDeinit(): void {
    if (!this.deinitialized && this.runtime.functions["OnDeinit"]) {
      try {
        callFunction(this.runtime, "OnDeinit");
      } catch (_err) {
        void _err;
        // ignore deinitialization errors
      }
    }
    this.deinitialized = true;
  }

  step(): void {
    this.callInit();
    if (this.runtime.programType === "script") {
      const entry = this.options.entryPoint || "OnStart";
      callFunction(this.runtime, entry);
      this.index = this.candles.length;
      this.callDeinit();
      return;
    }
    if (this.index >= this.candles.length) return;
    const entry =
      this.options.entryPoint ||
      (this.runtime.programType === "indicator" ? "OnCalculate" : "OnTick");
    const candle = this.candles[this.index];
    const symbol = this.options.symbol ?? "TEST";
    const tick = this.market.getTick(symbol, candle.time);
    this.runtime.globalValues.Bid = tick?.bid ?? candle.close;
    this.runtime.globalValues.Ask = tick?.ask ?? candle.close;
    const profit = this.session.broker.update(candle);
    if (profit) {
      this.session.account.applyProfit(profit);
    }
    if (this.runtime.functions["OnTimer"]) {
      while (this.terminal.shouldTriggerTimer(candle.time)) {
        callFunction(this.runtime, "OnTimer");
      }
    }
    callFunction(this.runtime, entry);
    if (this.runtime.functions["OnTrade"]) {
      while (this.pendingTradeEvents.length > 0) {
        const order = this.pendingTradeEvents.shift()!;
        const prevSelected = this.selectedOrder;
        this.selectedOrder = order;
        (this.runtime as any).tradeContext = { ticket: order.ticket, type: order.type };
        callFunction(this.runtime, "OnTrade");
        this.selectedOrder = prevSelected;
      }
    }
    if (this.runtime.functions["OnChartEvent"]) {
      for (const ev of this.terminal.consumeChartEvents()) {
        callFunction(this.runtime, "OnChartEvent", [ev.id, ev.lparam, ev.dparam, ev.sparam]);
      }
    }
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

  getRuntime(): RuntimeState {
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

  getReport(): BacktestReport {
    return {
      globals: this.runtime.globalValues,
      metrics: this.getAccountMetrics(),
      orders: this.session.broker.getAllOrders(),
    };
  }
}
