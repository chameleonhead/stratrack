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
import { createSeries } from "../functions/series";
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
    ...createSeries(context),
    ...createTrading(context),
  };
}
