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
import { InMemoryIndicatorEngine } from "./domain/indicator";

export function createLibs(ctx: ExecutionContext): MqlLibrary {
  Object.assign(ctx, {
    terminal: ctx.terminal ?? null,
    broker: ctx.broker ?? null,
    account: ctx.account ?? null,
    market: ctx.market ?? null,
    symbol: ctx.symbol ?? "",
    timeframe: ctx.timeframe ?? 0,
    digits: ctx.digits ?? 5,
    lastError: ctx.lastError ?? 0,
    getBid: ctx.getBid ?? (() => 0),
    getAsk: ctx.getAsk ?? (() => 0),
    getTime: ctx.getTime ?? (() => Date.now() / 1000),
    getStopFlag: ctx.getStopFlag ?? (() => 0),
    selectedOrder: ctx.selectedOrder ?? undefined,
    indicatorEngine: ctx.indicatorEngine ?? new InMemoryIndicatorEngine(),
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
  });

  return {
    ...createAccount(ctx),
    ...createCheck(ctx),
    ...createCommon(ctx),
    ...createCustomInd(ctx),
    ...createEventFunctions(ctx),
    ...createFiles(ctx),
    ...createGlobals(ctx),
    ...createIndicators(ctx),
    ...createMarketInformation(ctx),
    ...createObjects(ctx),
    ...createSeries(ctx),
    ...createTrading(ctx),
  };
}
