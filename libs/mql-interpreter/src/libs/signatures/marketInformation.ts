import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/marketinformation
export const marketinformationBuiltinSignatures: BuiltinSignaturesMap = {
  MarketInfo: {
    args: [
      { name: "symbol", type: "string" },
      { name: "type", type: "int" },
    ],
    returnType: "double",
    description: "Returns various data about securities listed in the 'Market Watch' window",
  },
  SymbolInfoDouble: {
    args: [
      { name: "name", type: "string" },
      { name: "prop_id", type: "int" },
    ],
    returnType: "double",
    description: "Returns the double value of the symbol for the corresponding property",
  },
  SymbolInfoInteger: {
    args: [
      { name: "name", type: "string" },
      { name: "prop_id", type: "int" },
    ],
    returnType: "long",
    description:
      "Returns a value of an integer type (long, datetime, int or bool) of a specified symbol for the corresponding property",
  },
  SymbolInfoSessionQuote: {
    args: [
      { name: "name", type: "string" },
      { name: "day_of_week", type: "int" },
      { name: "session_index", type: "int" },
      { name: "from", type: "datetime" },
      { name: "to", type: "datetime" },
    ],
    returnType: "bool",
    description:
      "Allows receiving time of beginning and end of the specified quoting sessions for a specified symbol and day of week.",
  },
  SymbolInfoSessionTrade: {
    args: [
      { name: "name", type: "string" },
      { name: "day_of_week", type: "int" },
      { name: "session_index", type: "int" },
      { name: "from", type: "datetime" },
      { name: "to", type: "datetime" },
    ],
    returnType: "bool",
    description:
      "Allows receiving time of beginning and end of the specified trading sessions for a specified symbol and day of week.",
  },
  SymbolInfoString: {
    args: [
      { name: "name", type: "string" },
      { name: "prop_id", type: "int" },
    ],
    returnType: "string",
    description:
      "Returns a value of the string type of a specified symbol for the corresponding property",
  },
  SymbolInfoTick: {
    args: [
      { name: "name", type: "string" },
      { name: "tick", type: "MqlTick" },
    ],
    returnType: "bool",
    description:
      "Returns the current prices for the specified symbol in a variable of the MqlTick type",
  },
  SymbolName: {
    args: [
      { name: "pos", type: "int" },
      { name: "selected", type: "bool", optional: true },
    ],
    returnType: "string",
    description: "Returns the name of a specified symbol",
  },
  SymbolSelect: {
    args: [
      { name: "name", type: "string" },
      { name: "select", type: "bool" },
    ],
    returnType: "bool",
    description: "Selects a symbol in the Market Watch window or removes a symbol from the window",
  },
  SymbolsTotal: {
    args: [{ name: "selected", type: "bool", optional: true }],
    returnType: "int",
    description: "Returns the number of available (selected in Market Watch or all) symbols",
  },
};
