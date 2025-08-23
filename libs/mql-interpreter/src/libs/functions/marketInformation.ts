import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createMarketInformation(
  context: ExecutionContext
): Record<string, BuiltinFunction> {
  const market = context.market!;
  const getTime = context.getTime ?? (() => Date.now() / 1000);
  const digits = context.digits ?? 5;
  const point = Math.pow(10, -digits);
  return {
    MarketInfo: (symbol: string, type: number) => {
      const tick = market.getTick(symbol, getTime());
      switch (type) {
        case 9:
          return tick?.bid ?? 0;
        case 10:
          return tick?.ask ?? 0;
        case 11:
          return point;
        case 12:
          return digits;
        case 13:
          return tick ? Math.round((tick.ask - tick.bid) / point) : 0;
        default:
          return 0;
      }
    },
    SymbolsTotal: (selected = false) => market.getSymbols(selected).length,
    SymbolName: (index: number, selected = false) => {
      const list = market.getSymbols(selected);
      return list[index] ?? "";
    },
    SymbolSelect: (symbol: string, enable: boolean) => market.select(symbol, enable),
    SymbolInfoDouble: (_symbol: string, _prop: number) => 0,
    SymbolInfoInteger: (_symbol: string, _prop: number) => 0,
    SymbolInfoString: (_symbol: string, _prop: number) => "",
  };
}
