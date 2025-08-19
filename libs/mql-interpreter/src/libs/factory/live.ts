import { MqlLibrary } from "../types";
import { createMarketInformation } from "../domain/marketInformation/live";
import { createTrading, TradingApi } from "../domain/trading/live";

export interface BrokerApi extends TradingApi {
  getMA: (...args: any[]) => number;
}

export function createLiveLibs(api: BrokerApi): MqlLibrary {
  return {
    iMA: api.getMA.bind(api),
    ...createMarketInformation(),
    ...createTrading(api),
  };
}
