import { BuiltinFunction } from "./types";

export const MarketInfo: BuiltinFunction = (symbol: string, type: number) => {
  // Basic implementation - returns dummy values for common properties
  switch (type) {
    case 1: // MODE_LOW
      return 1.0;
    case 2: // MODE_HIGH  
      return 2.0;
    case 9: // MODE_BID
      return 1.5;
    case 10: // MODE_ASK
      return 1.51;
    case 11: // MODE_POINT
      return 0.0001;
    case 12: // MODE_DIGITS
      return 4;
    case 13: // MODE_SPREAD
      return 1;
    case 14: // MODE_STOPLEVEL
      return 0;
    case 15: // MODE_LOTSIZE
      return 100000;
    case 16: // MODE_TICKVALUE
      return 1.0;
    case 17: // MODE_TICKSIZE
      return 0.0001;
    default:
      return 0.0;
  }
};

export const SymbolInfoDouble: BuiltinFunction = (name: string, propId: number) => {
  // Basic implementation - returns dummy values for common properties
  switch (propId) {
    case 0: // SYMBOL_BID
      return 1.5;
    case 1: // SYMBOL_ASK
      return 1.51;
    case 2: // SYMBOL_POINT
      return 0.0001;
    case 3: // SYMBOL_TRADE_TICK_VALUE
      return 1.0;
    case 4: // SYMBOL_TRADE_TICK_SIZE
      return 0.0001;
    case 5: // SYMBOL_TRADE_CONTRACT_SIZE
      return 100000;
    case 6: // SYMBOL_VOLUME_MIN
      return 0.01;
    case 7: // SYMBOL_VOLUME_MAX
      return 100.0;
    case 8: // SYMBOL_VOLUME_STEP
      return 0.01;
    default:
      return 0.0;
  }
};

export const SymbolInfoInteger: BuiltinFunction = (name: string, propId: number) => {
  // Basic implementation - returns dummy values for common properties
  switch (propId) {
    case 0: // SYMBOL_DIGITS
      return 4;
    case 1: // SYMBOL_SPREAD
      return 1;
    case 2: // SYMBOL_TRADE_STOPS_LEVEL
      return 0;
    case 3: // SYMBOL_TRADE_FREEZE_LEVEL
      return 0;
    default:
      return 0;
  }
};

export const SymbolInfoString: BuiltinFunction = (name: string, propId: number) => {
  // Basic implementation - returns dummy values
  switch (propId) {
    case 0: // SYMBOL_CURRENCY_BASE
      return "GBP";
    case 1: // SYMBOL_CURRENCY_PROFIT
      return "USD";
    case 2: // SYMBOL_CURRENCY_MARGIN
      return "GBP";
    case 3: // SYMBOL_DESCRIPTION
      return name;
    default:
      return name;
  }
};

export const SymbolName: BuiltinFunction = (pos: number, selected = true) => {
  // Basic implementation - returns dummy symbol names
  const symbols = ["GBPUSD", "EURUSD", "USDJPY", "AUDUSD", "USDCAD"];
  if (pos >= 0 && pos < symbols.length) {
    return symbols[pos];
  }
  return "";
};

export const SymbolSelect: BuiltinFunction = (name: string, select: boolean) => {
  // Basic implementation - always return true
  return true;
};

export const SymbolsTotal: BuiltinFunction = (selected = true) => {
  // Basic implementation - return fixed number of symbols
  return 5;
};
