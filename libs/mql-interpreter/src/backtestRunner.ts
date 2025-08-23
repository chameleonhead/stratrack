import { parse, ParseError } from "./parser/parser";
import { preprocessWithProperties, PreprocessOptions } from "./parser/preprocess";
import { execute, callFunction } from "./runtime/runtime";
import { semanticCheck } from "./semantic/checker";
import type { RuntimeState, ProgramType } from "./runtime/types";
import type { Declaration } from "./parser/ast";
import { builtinSignatures } from "./libs/signatures";
import type { ExecutionContext } from "./libs/domain/types";
import { registerEnvBuiltins } from "./libs/functions";
import { InMemoryBroker as Broker, Order } from "./libs/domain/broker";
import { InMemoryAccount as Account, AccountMetrics } from "./libs/domain/account";
import { InMemoryMarketData as MarketData } from "./libs/domain/marketData";
import type { Candle, Tick } from "./libs/domain/marketData";
import { InMemoryTerminal as VirtualTerminal, TerminalStorage } from "./libs/domain/terminal";
import { IndicatorSource, InMemoryIndicatorSource } from "./libs/indicatorSource";
import { createLibs } from "./libs/factory";

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
  /** Source provider for custom indicators referenced by iCustom */
  indicatorSource?: IndicatorSource;
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
  private initialized = false;
  private deinitialized = false;
  private pendingTradeEvents: Order[] = [];
  private indicatorSource: IndicatorSource;
  private context: ExecutionContext;
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
    // Map legacy MQL4 event handlers (init/start/deinit) to MQL5-style names
    // so the runtime/backtest loop can invoke them uniformly.
    if (!runtime.functions["OnInit"] && runtime.functions["init"]) {
      runtime.functions["OnInit"] = runtime.functions["init"];
    }
    if (!runtime.functions["OnDeinit"] && runtime.functions["deinit"]) {
      runtime.functions["OnDeinit"] = runtime.functions["deinit"];
    }
    if (!runtime.functions["OnTick"] && runtime.functions["start"]) {
      runtime.functions["OnTick"] = runtime.functions["start"];
    }
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
    this.indicatorSource = this.options.indicatorSource ?? new InMemoryIndicatorSource();
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
    const baseGetCandles = this.market.getCandles.bind(this.market);
    (this.market as any).getCandles = (symbol: string, timeframe: number): Candle[] => {
      const sym = symbol && String(symbol).length ? symbol : (this.options.symbol ?? "TEST");
      const tf = timeframe || this.runtime.globalValues._Period;
      const arr = baseGetCandles(sym, tf);
      const time = this.candles[Math.min(this.index, this.candles.length - 1)]?.time ?? 0;
      let i = arr.length - 1;
      while (i >= 0 && arr[i].time > time) i--;
      return arr.slice(0, i + 1);
    };
    const period =
      options.timeframe ?? (candles.length > 1 ? candles[1].time - candles[0].time : 0);
    this.context = {
      terminal: this.terminal,
      broker,
      account,
      market: this.market,
      symbol,
      timeframe: period,
      digits: 5,
      lastError: 0,
      getBid: () => this.runtime.globalValues.Bid,
      getAsk: () => this.runtime.globalValues.Ask,
      getTime: () => this.candles[Math.min(this.index, this.candles.length - 1)]?.time ?? 0,
      getStopFlag: () => this.runtime.globalValues._StopFlag,
      indicatorSource: this.indicatorSource,
    };
    this.initializeGlobals();
    const libs = createLibs(this.context);
    Object.defineProperties(this.context, {
      lastError: {
        get: () => this.runtime.globalValues._LastError,
        set: (v: number) => {
          this.runtime.globalValues._LastError = v;
        },
        configurable: true,
      },
      digits: {
        get: () => this.runtime.globalValues.Digits,
        set: (v: number) => {
          this.runtime.globalValues.Digits = v;
          this.runtime.globalValues._Digits = v;
          const p = Math.pow(10, -v);
          this.runtime.globalValues.Point = p;
          this.runtime.globalValues._Point = p;
        },
        configurable: true,
      },
    });
    registerEnvBuiltins(libs);
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
        const prevSelected = this.context.selectedOrder;
        this.context.selectedOrder = order;
        (this.runtime as any).tradeContext = { ticket: order.ticket, type: order.type };
        callFunction(this.runtime, "OnTrade");
        this.context.selectedOrder = prevSelected;
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

  getContext(): ExecutionContext {
    return this.context;
  }

  getReport(): BacktestReport {
    return {
      globals: this.runtime.globalValues,
      metrics: this.getAccountMetrics(),
      orders: this.session.broker.getAllOrders(),
    };
  }
}
