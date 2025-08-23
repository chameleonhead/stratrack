import type { ExecutionContext } from "./domain/types";
import type { MqlLibrary } from "./types";
import { createAccount } from "./functions/account";
import { createCheck } from "./functions/check";
import { createCommon } from "./functions/common";
import { createCustomInd } from "./functions/customind";
import { createEventFunctions } from "./functions/eventFunctions";
import { createFiles } from "./functions/files";
import { createGlobals } from "./functions/globals";
import { createIndicators } from "./functions/indicators";
import { createMarketInformation } from "./functions/marketInformation";
import { createObjects } from "./functions/objects";
import { createSeries } from "./functions/series";
import { createTrading } from "./functions/trading";
import { IndicatorCache } from "./indicatorCache";

export function createLibs(ctx: ExecutionContext): MqlLibrary {
  const context: ExecutionContext = {
    terminal: ctx.terminal ?? null,
    broker: ctx.broker ?? null,
    account: ctx.account ?? null,
    market: ctx.market ?? null,
    symbol: ctx.symbol ?? "",
    timeframe: ctx.timeframe ?? 0,
    digits: ctx.digits ?? 5,
    lastError: ctx.lastError ?? 0,
    // Indicator-related state is always initialized fresh for each script
    // execution to avoid leaking values from callers.
    indicators: new IndicatorCache(),
    hideTestIndicators: false,
    indicatorBuffers: [],
    indicatorCounted: 0,
    indicatorDigits: ctx.digits ?? 5,
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
