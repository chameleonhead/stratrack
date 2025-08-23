import { MqlLibrary } from "../types";
import { ExecutionContext } from "../domain/types";
import { createAccount } from "../functions/account";
import { createCheck } from "../functions/check";
import { createCommon } from "../functions/common";
import { createEventFunctions } from "../functions/eventFunctions";
import { createFiles } from "../functions/files";
import { createCustomInd } from "../functions/customind";
import { createGlobals } from "../functions/globals";
import { createIndicators } from "../functions/indicators";
import { createMarketInformation } from "../functions/marketInformation";
import { createTrading } from "../functions/trading";

export interface BrokerApi {
  sendOrder: (request: any) => any;
  getMA: (...args: any[]) => number;
}

export function createLiveLibs(api: BrokerApi): MqlLibrary {
  const context: ExecutionContext = {
    terminal: null,
    broker: api as any,
    account: null,
    market: null,
    symbol: "",
    timeframe: 0,
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
    iMA: api.getMA.bind(api),
    ...createAccount(context),
    ...createCheck(context),
    ...createCommon(context),
    ...createCustomInd(context),
    ...createEventFunctions(context),
    ...createFiles(context),
    ...createGlobals(context),
    ...createIndicators(context),
    ...createMarketInformation(context),
    ...createTrading(context),
  };
}
