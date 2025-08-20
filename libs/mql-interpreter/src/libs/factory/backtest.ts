import type { Candle } from "../market.types";
import { MarketData } from "../marketData";
import { Broker } from "../broker";
import { Account } from "../account";
import { MqlLibrary } from "../types";
import { createMarketInformation } from "../functions/marketInformation/backtest";
import { createTrading } from "../functions/trading/backtest";
import { setContext } from "../functions/context";

export function createBacktestLibs(data: MarketData): MqlLibrary {
  const indicatorBuffers: any[] = [];
  const indicatorLabels: string[] = [];
  const indicatorShifts: number[] = [];
  let _lastError = 0;
  const broker = new Broker();
  const account = new Account();
  setContext({ terminal: null, broker, account, market: data, symbol: "", timeframe: 0 });

  const candlesFor = (symbol: string, timeframe: number): Candle[] =>
    data.getCandles(symbol, timeframe);

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

  const barIndex = (arr: Candle[], shift: number) => arr.length - 1 - shift;

  return {
    // --- account helpers ---
    AccountBalance: () => account.getMetrics(broker, 0, 0).balance,
    AccountCompany: () => "Backtest",
    AccountCredit: () => 0,
    AccountCurrency: () => account.getCurrency(),
    AccountEquity: () => account.getMetrics(broker, 0, 0).equity,
    AccountFreeMargin: () => account.getMetrics(broker, 0, 0).freeMargin,
    AccountFreeMarginCheck: () => account.getMetrics(broker, 0, 0).equity,
    AccountFreeMarginMode: () => 0,
    AccountInfoDouble: () => 0,
    AccountInfoInteger: () => 0,
    AccountInfoString: () => "",
    AccountLeverage: () => 1,
    AccountMargin: () => account.getMetrics(broker, 0, 0).margin,
    AccountName: () => "Backtest",
    AccountNumber: () => 1,
    AccountProfit: () =>
      account.getMetrics(broker, 0, 0).openProfit + account.getMetrics(broker, 0, 0).closedProfit,
    AccountServer: () => "Backtest",
    AccountStopoutLevel: () => 0,
    AccountStopoutMode: () => 0,

    // --- series access helpers ---
    Bars: (symbol: string, timeframe: number) => candlesFor(symbol, timeframe).length,
    iBars: (symbol: string, timeframe: number) => candlesFor(symbol, timeframe).length,
    iBarShift: (symbol: string, timeframe: number, time: number, exact?: boolean) => {
      const arr = candlesFor(symbol, timeframe);
      for (let i = 0; i < arr.length; i++) {
        const c = arr[i];
        const next = arr[i + 1];
        if (c.time === time) return i;
        if (!exact && next && c.time < time && time < next.time) return i;
      }
      return -1;
    },
    iOpen: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.open ?? 0;
    },
    iHigh: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.high ?? 0;
    },
    iLow: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.low ?? 0;
    },
    iClose: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.close ?? 0;
    },
    iTime: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.time ?? 0;
    },
    iVolume: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.volume ?? 0;
    },

    CopyRates: (symbol: string, timeframe: number, start: number, count: number, dst: any[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
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
        copied++;
      }
      return copied;
    },
    CopyTime: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].time;
        copied++;
      }
      return copied;
    },
    CopyOpen: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].open;
        copied++;
      }
      return copied;
    },
    CopyHigh: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].high;
        copied++;
      }
      return copied;
    },
    CopyLow: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].low;
        copied++;
      }
      return copied;
    },
    CopyClose: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].close;
        copied++;
      }
      return copied;
    },
    CopyTickVolume: (
      symbol: string,
      timeframe: number,
      start: number,
      count: number,
      dst: number[]
    ) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].volume ?? 0;
        copied++;
      }
      return copied;
    },

    SeriesInfoInteger: (symbol: string, timeframe: number, prop: number) => {
      const arr = candlesFor(symbol, timeframe);
      if (prop === 0) return arr.length;
      return 0;
    },
    RefreshRates: () => 1,
    ResetLastError: () => {
      _lastError = 0;
      return 0;
    },

    IndicatorBuffers: (count: number) => {
      indicatorBuffers.length = count;
      indicatorLabels.length = count;
      indicatorShifts.length = count;
      return 0;
    },
    SetIndexBuffer: (index: number, arr: number[]) => {
      if (index < 0 || index >= indicatorBuffers.length) return false;
      indicatorBuffers[index] = arr;
      return true;
    },
    SetIndexLabel: (index: number, text: string) => {
      if (index < 0 || index >= indicatorLabels.length) return false;
      indicatorLabels[index] = text;
      return true;
    },
    SetIndexShift: (index: number, shift: number) => {
      if (index < 0 || index >= indicatorShifts.length) return false;
      indicatorShifts[index] = shift;
      return true;
    },
    IndicatorCounted: () => 0,
    IndicatorDigits: () => 0,
    IndicatorSetDouble: (_prop: number, _val: number) => 0,
    IndicatorSetInteger: (_prop: number, _val: number) => 0,
    IndicatorSetString: (_prop: number, _val: string) => 0,
    IndicatorShortName: (_name: string) => 0,

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
      const idx = arr.length - 1 - (shift + maShift);
      if (idx < period - 1) return 0;
      let sum = 0;
      for (let i = idx - period + 1; i <= idx; i++) {
        sum += priceVal(arr[i], applied);
      }
      return sum / period;
    },
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
      const idx = arr.length - 1 - shift;
      if (idx < Math.max(fast, slow)) return 0;
      const kFast = 2 / (fast + 1);
      const kSlow = 2 / (slow + 1);
      const kSig = 2 / (signal + 1);
      let emaFast = priceVal(arr[0], applied);
      let emaSlow = priceVal(arr[0], applied);
      const macdVals: number[] = [emaFast - emaSlow];
      for (let i = 1; i <= idx; i++) {
        const price = priceVal(arr[i], applied);
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
    iATR: (symbol: string, timeframe: number, period: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      const idx = arr.length - 1 - shift;
      if (idx < period || idx <= 0) return 0;
      let atr = 0;
      for (let i = 1; i <= idx; i++) {
        const cur = arr[i];
        const prev = arr[i - 1];
        const tr = Math.max(
          cur.high - cur.low,
          Math.abs(cur.high - prev.close),
          Math.abs(cur.low - prev.close)
        );
        if (i <= period) {
          atr = (atr * (i - 1) + tr) / i;
        } else {
          atr = (atr * (period - 1) + tr) / period;
        }
      }
      return atr;
    },
    iRSI: (symbol: string, timeframe: number, period: number, applied: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      const idx = arr.length - 1 - shift;
      if (idx < period) return 0;
      let gains = 0;
      let losses = 0;
      for (let i = idx - period + 1; i <= idx; i++) {
        const cur = priceVal(arr[i], applied);
        const prev = priceVal(arr[i - 1], applied);
        const diff = cur - prev;
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      if (avgLoss === 0) return 100;
      if (avgGain === 0) return 0;
      const rs = avgGain / avgLoss;
      return 100 - 100 / (1 + rs);
    },
    ...createMarketInformation(),
    ...createTrading(),
  };
}
