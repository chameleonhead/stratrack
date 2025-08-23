import { MqlLibrary } from "../types";
import { ExecutionContext } from "../functions/types";
import { createMarketInformation } from "../functions/marketInformation";
import { createTrading } from "../functions/trading";
import { createFiles } from "../functions/files";
import { createCommon } from "../functions/common";
import { createGlobals } from "../functions/globals";
import { createEventFunctions } from "../functions/eventFunctions";

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
  }
  return {
    iMA: api.getMA.bind(api),
    ...createFiles(context),
    ...createMarketInformation(context),
    ...createTrading(context),
    ...createCommon(context),
    ...createGlobals(context),
    ...createEventFunctions(context),
  };
}
