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

export function createBacktestLibs(data: MarketData): MqlLibrary {
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
    digits: 5,
    lastError: 0,
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

  return {
    // --- account helpers ---
    RefreshRates: () => 1,

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
