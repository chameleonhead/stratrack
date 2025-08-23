import { MqlLibrary } from "../types";
import { ExecutionContext } from "../domain/types";
import { createAccount } from "../functions/account";
import { createCheck } from "../functions/check";
import { createCommon } from "../functions/common";
import { createEventFunctions } from "../functions/eventFunctions";
import { createFiles } from "../functions/files";
import { createGlobals } from "../functions/globals";
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
  };
  return {
    iMA: api.getMA.bind(api),
    ...createAccount(context),
    ...createCheck(context),
    ...createCommon(context),
    ...createEventFunctions(context),
    ...createFiles(context),
    ...createGlobals(context),
    ...createMarketInformation(context),
    ...createTrading(context),
  };
}
