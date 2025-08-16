import { MqlLibrary } from "./types";

export interface BrokerApi {
  getMA: (...args: any[]) => number;
  sendOrder: (request: any) => any;
}

export function createLiveLibs(api: BrokerApi): MqlLibrary {
  return {
    iMA: api.getMA.bind(api),
    OrderSend: api.sendOrder.bind(api),
  };
}
