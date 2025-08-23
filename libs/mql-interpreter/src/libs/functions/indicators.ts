/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";
import type { Candle, InMemoryMarketData as MarketData } from "../domain/marketData";
import type { InMemoryTerminal as VirtualTerminal } from "../domain/terminal";
import { BacktestRunner } from "../../backtestRunner";

export function createIndicators(context: ExecutionContext): Record<string, BuiltinFunction> {
  // ヘルパー関数
  const candlesFor = (symbol: string, timeframe: number): Candle[] => {
    if (!context.market) return [];
    return context.market.getCandles(symbol, timeframe);
  };

  const priceVal = (candle: Candle, applied: number): number => {
    switch (applied) {
      case 1:
        return candle.open;
      case 2:
        return candle.high;
      case 3:
        return candle.low;
      case 4:
        return (candle.high + candle.low) / 2;
      case 5:
        return (candle.high + candle.low + candle.close) / 3;
      case 6:
        return (candle.high + candle.low + 2 * candle.close) / 4;
      default:
        return candle.close;
    }
  };

  return {
    // Moving Average
    iMA: (
      symbol: string,
      timeframe: number,
      period: number,
      maShift: number,
      _maMethod: number,
      applied: number,
      shift: number
    ) => {
      const arr = candlesFor(symbol, timeframe);
      const curIdx = arr.length - 1;
      const engine = context.indicatorEngine;
      if (!engine) return 0;

      const key = {
        type: "iMA",
        symbol,
        timeframe,
        params: { period, maMethod: _maMethod, applied },
      } as const;

      const ctx = engine.getOrCreate(key, () => ({
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

      const idx = arr.length - 1 - (shift + maShift);
      return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
    },

    // MACD
    iMACD: (
      symbol: string,
      timeframe: number,
      fast: number,
      slow: number,
      signal: number,
      applied: number,
      mode: number,
      shift: number
    ) => {
      const arr = candlesFor(symbol, timeframe);
      const curIdx = arr.length - 1;
      const engine = context.indicatorEngine;
      if (!engine) return 0;

      const key = {
        type: "iMACD",
        symbol,
        timeframe,
        params: { fast, slow, signal, applied },
      } as const;

      const ctx = engine.getOrCreate(key, () => ({
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

      const idx = arr.length - 1 - shift;
      if (idx < 0) return 0;
      if (mode === 1) return ctx.signal[idx] ?? 0;
      if (mode === 2) return ctx.hist[idx] ?? 0;
      return ctx.macd[idx] ?? 0;
    },

    // Average True Range
    iATR: (symbol: string, timeframe: number, period: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      const curIdx = arr.length - 1;
      const engine = context.indicatorEngine;
      if (!engine) return 0;

      const key = {
        type: "iATR",
        symbol,
        timeframe,
        params: { period },
      } as const;

      const ctx = engine.getOrCreate(key, () => ({
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

      const idx = arr.length - 1 - shift;
      return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
    },

    // Relative Strength Index
    iRSI: (symbol: string, timeframe: number, period: number, applied: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      const curIdx = arr.length - 1;
      const engine = context.indicatorEngine;
      if (!engine) return 0;

      const key = {
        type: "iRSI",
        symbol,
        timeframe,
        params: { period, applied },
      } as const;

      const ctx = engine.getOrCreate(key, () => ({
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

      const idx = arr.length - 1 - shift;
      return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
    },

    // Custom Indicator
    iCustom: (symbol: string, timeframe: number, name: string, ...args: any[]) => {
      const sym = symbol && String(symbol).length ? String(symbol) : (context.symbol ?? "");
      const tf = timeframe || context.timeframe || 0;
      if (!context.market) return 0;
      const arr = candlesFor(sym, tf);
      const curIdx = arr.length - 1;
      const mode = Number(args[args.length - 2] ?? 0);
      const shift = Number(args[args.length - 1] ?? 0);
      const params = args.slice(0, -2);

      const engine = context.indicatorEngine;
      const source = engine?.getSource(name);
      if (!source || !engine) return 0;

      const key = { type: `iCustom:${name}`, symbol: sym, timeframe: tf, params } as const;
      const ctx = engine.getOrCreate(key, () => ({
        last: -1,
        buffers: [] as number[][],
        runner: new BacktestRunner(source, arr, {
          symbol: sym && String(sym).length ? sym : undefined,
          timeframe: tf,
          indicatorEngine: engine,
          market: context.market as MarketData,
          indicatorCache: engine.getCache(),
          terminal: context.terminal as VirtualTerminal,
        }),
      }));

      if (ctx.last < curIdx) {
        for (let i = ctx.last + 1; i <= curIdx; i++) ctx.runner.step();
        ctx.buffers = ctx.runner.getRuntime().globalValues._IndicatorBuffers ?? [];
        ctx.last = curIdx;
      }
      const idx = curIdx - shift;
      return idx < 0 ? 0 : (ctx.buffers[mode]?.[idx] ?? 0);
    },

    // その他のインジケーター関数（簡易実装）
    iAC: (symbol: string, timeframe: number, shift: number) => 0,
    iAD: (symbol: string, timeframe: number, shift: number) => 0,
    iADX: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      mode: number,
      shift: number
    ) => 0,
    iAlligator: (
      symbol: string,
      timeframe: number,
      jaw_period: number,
      jaw_shift: number,
      teeth_period: number,
      teeth_shift: number,
      lips_period: number,
      lips_shift: number,
      ma_method: number,
      applied_price: number,
      mode: number,
      shift: number
    ) => 0,
    iAO: (symbol: string, timeframe: number, shift: number) => 0,
    iBands: (
      symbol: string,
      timeframe: number,
      period: number,
      deviation: number,
      bands_shift: number,
      applied_price: number,
      mode: number,
      shift: number
    ) => 0,
    iBandsOnArray: (
      array: number[],
      total: number,
      period: number,
      deviation: number,
      bands_shift: number,
      mode: number,
      shift: number
    ) => 0,
    iBearsPower: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iBullsPower: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iBWMFI: (symbol: string, timeframe: number, shift: number) => 0,
    iCCI: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iCCIOnArray: (array: number[], total: number, period: number, shift: number) => 0,
    iDeMarker: (symbol: string, timeframe: number, period: number, shift: number) => 0,
    iEnvelopes: (
      symbol: string,
      timeframe: number,
      ma_period: number,
      ma_shift: number,
      ma_method: number,
      applied_price: number,
      deviation: number,
      mode: number,
      shift: number
    ) => 0,
    iEnvelopesOnArray: (
      array: number[],
      total: number,
      ma_period: number,
      ma_shift: number,
      ma_method: number,
      deviation: number,
      mode: number,
      shift: number
    ) => 0,
    iForce: (
      symbol: string,
      timeframe: number,
      period: number,
      ma_method: number,
      applied_price: number,
      shift: number
    ) => 0,
    iFractals: (symbol: string, timeframe: number, mode: number, shift: number) => 0,
    iGator: (
      symbol: string,
      timeframe: number,
      jaw_period: number,
      jaw_shift: number,
      teeth_period: number,
      teeth_shift: number,
      lips_period: number,
      lips_shift: number,
      ma_method: number,
      applied_price: number,
      mode: number,
      shift: number
    ) => 0,
    iIchimoku: (
      symbol: string,
      timeframe: number,
      tenkan_sen: number,
      kijun_sen: number,
      senkou_span_b: number,
      mode: number,
      shift: number
    ) => 0,
    iMAOnArray: (
      array: number[],
      total: number,
      period: number,
      ma_shift: number,
      ma_method: number,
      shift: number
    ) => 0,
    iMFI: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iMomentum: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iMomentumOnArray: (array: number[], total: number, period: number, shift: number) => 0,
    iOBV: (symbol: string, timeframe: number, applied_price: number, shift: number) => 0,
    iOsMA: (
      symbol: string,
      timeframe: number,
      fast_ema_period: number,
      slow_ema_period: number,
      signal_period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iRSIOnArray: (array: number[], total: number, period: number, shift: number) => 0,
    iRVI: (symbol: string, timeframe: number, period: number, mode: number, shift: number) => 0,
    iSAR: (symbol: string, timeframe: number, step: number, maximum: number, shift: number) => 0,
    iStdDev: (
      symbol: string,
      timeframe: number,
      ma_period: number,
      ma_shift: number,
      ma_method: number,
      applied_price: number,
      shift: number
    ) => 0,
    iStdDevOnArray: (
      array: number[],
      total: number,
      ma_period: number,
      ma_shift: number,
      ma_method: number,
      shift: number
    ) => 0,
    iStochastic: (
      symbol: string,
      timeframe: number,
      k_period: number,
      d_period: number,
      slowing: number,
      method: number,
      price_field: number,
      mode: number,
      shift: number
    ) => 0,
    iWPR: (symbol: string, timeframe: number, period: number, shift: number) => 0,
  };
}
