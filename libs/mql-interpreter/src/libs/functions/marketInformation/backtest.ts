import type { BuiltinFunction } from "../types";
import { getContext } from "../context";

export function createMarketInformation(): Record<string, BuiltinFunction> {
  const market = getContext().market!;
  return {
    MarketInfo: (symbol: string, type: number) => {
      const tick = market.getTick(symbol, Date.now() / 1000);
      switch (type) {
        case 9:
          return tick?.bid ?? 0;
        case 10:
          return tick?.ask ?? 0;
        case 11:
          return 0.00001;
        case 12:
          return 5;
        case 13:
          return tick ? Math.round((tick.ask - tick.bid) / 0.00001) : 0;
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
  };
}
