import type { Candle } from "../domain/marketData";
import type { ExecutionContext } from "../domain/types";
import { InMemoryMarketData as MarketData } from "../domain/marketData";
import { InMemoryBroker as Broker } from "../domain/broker";
import { InMemoryAccount as Account } from "../domain/account";
import { MqlLibrary } from "../types";
import { createAccount } from "../functions/account";
import { createCheck } from "../functions/check";
import { createCommon } from "../functions/common";
import { createCustomInd } from "../functions/customind";
import { createEventFunctions } from "../functions/eventFunctions";
import { createFiles } from "../functions/files";
import { createGlobals } from "../functions/globals";
import { createIndicators } from "../functions/indicators";
import { createMarketInformation } from "../functions/marketInformation";
import { createObjects } from "../functions/objects";
import { createTrading } from "../functions/trading";
import { IndicatorCache } from "../indicatorCache";
import { BacktestRunner } from "../backtestRunner";
import { IndicatorSource, InMemoryIndicatorSource } from "../indicatorSource";

export function createBacktestLibs(
  data: MarketData,
  indicatorSource: IndicatorSource = new InMemoryIndicatorSource()
): MqlLibrary {
  const indicatorBuffers: any[] = [];
  const indicatorLabels: string[] = [];
  const indicatorShifts: number[] = [];
  let _lastError = 0;
  const broker = new Broker();
  const account = new Account();
  const indicators = new IndicatorCache();
  const context: ExecutionContext = {
    terminal: null,
    broker,
    account,
    market: data,
    symbol: "",
    timeframe: 0,
    indicators,
    // Initialize custom indicator state
    hideTestIndicators: false,
    indicatorBuffers: [],
    indicatorCounted: 0,
    indicatorDigits: 5,
    indicatorShortName: "",
    indexArrows: {},
    indexDrawBegins: {},
    indexEmptyValues: {},
    indexLabels: {},
    indexShifts: {},
    indexStyles: {},
    levelStyles: {},
    levelValues: {},
  };

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








    ...createAccount(context),
    ...createCheck(context),
    ...createCommon(context),
    ...createCustomInd(context),
    ...createEventFunctions(context),
    ...createFiles(context),
    ...createGlobals(context),
    ...createIndicators(context),
    ...createMarketInformation(context),
    ...createObjects(context),
    ...createTrading(context),
  };
}
