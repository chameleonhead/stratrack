import { MqlLibrary } from "../types";
import { createMarketInformation } from "../functions/marketInformation/live";
import { createTrading } from "../functions/trading/live";
import { setContext } from "../functions/context";

export interface BrokerApi {
  sendOrder: (request: any) => any;
  getMA: (...args: any[]) => number;
}

export function createLiveLibs(api: BrokerApi): MqlLibrary {
  setContext({
    terminal: null,
    broker: api as any,
    account: null,
    market: null,
    symbol: "",
    timeframe: 0,
  });
  return {
    iMA: api.getMA.bind(api),
    ...createMarketInformation(),
    ...createTrading(),
  };
}
