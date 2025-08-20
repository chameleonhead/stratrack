import type { BuiltinFunction } from "../types";
import { getContext } from "../context";

export function createMarketInformation(): Record<string, BuiltinFunction> {
  const market = getContext().market;
  return {
    MarketInfo: (symbol: string, type: number) => {
      if (!market) return 0;
      const tick = market.getTick(symbol, Date.now() / 1000);
      switch (type) {
        case 9:
          return tick?.bid ?? 0;
        case 10:
          return tick?.ask ?? 0;
        default:
          return 0;
      }
    },
    SymbolsTotal: (selected = false) => (market ? market.getSymbols(selected).length : 0),
    SymbolName: (index: number, selected = false) => {
      const list = market ? market.getSymbols(selected) : [];
      return list[index] ?? "";
    },
    SymbolSelect: (symbol: string, enable: boolean) =>
      market ? market.select(symbol, enable) : true,
  };
}
