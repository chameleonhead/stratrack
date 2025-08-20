import type { BuiltinFunction } from "../types";
import { getContext } from "../context";

export function createTrading(): Record<string, BuiltinFunction> {
  const broker = getContext().broker!;
  return {
    OrderSend: broker.sendOrder.bind(broker),
  };
}
