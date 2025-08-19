import type { BuiltinFunction } from "../../common/types";

export interface TradingApi {
  sendOrder: (request: any) => any;
}

export function createTrading(api: TradingApi): Record<string, BuiltinFunction> {
  return {
    OrderSend: api.sendOrder.bind(api),
  };
}
