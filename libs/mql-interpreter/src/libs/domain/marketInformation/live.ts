import type { BuiltinFunction } from "../../common/types";

export function createMarketInformation(): Record<string, BuiltinFunction> {
  return {
    MarketInfo: () => 0,
    SymbolsTotal: () => 0,
    SymbolName: () => "",
    SymbolSelect: () => true,
  };
}
