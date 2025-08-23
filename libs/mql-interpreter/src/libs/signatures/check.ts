import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/check
export const checkBuiltinSignatures: BuiltinSignaturesMap = {
  Digits: {
    args: [],
    returnType: "int",
    description:
      "Returns the number of decimal digits determining the accuracy of the price value of the current chart symbol",
  },
  GetLastError: {
    args: [],
    returnType: "int",
    description: "Returns the last error",
  },
  IsConnected: {
    args: [],
    returnType: "bool",
    description: "Checks connection between client terminal and server",
  },
  IsDemo: {
    args: [],
    returnType: "bool",
    description: "Checks if the Expert Advisor runs on a demo account",
  },
  IsDllsAllowed: {
    args: [],
    returnType: "bool",
    description: "Checks if the DLL function call is allowed for the Expert Advisor",
  },
  IsExpertEnabled: {
    args: [],
    returnType: "bool",
    description: "Checks if Expert Advisors are enabled for running",
  },
  IsLibrariesAllowed: {
    args: [],
    returnType: "bool",
    description: "Checks if the Expert Advisor can call library function",
  },
  IsOptimization: {
    args: [],
    returnType: "bool",
    description: "Checks if Expert Advisor runs in the Strategy Tester optimization mode",
  },
  IsStopped: {
    args: [],
    returnType: "bool",
    description: "Returns true, if an mql4 program has been commanded to stop its operation",
  },
  IsTesting: {
    args: [],
    returnType: "bool",
    description: "Checks if the Expert Advisor runs in the testing mode",
  },
  IsTradeAllowed: {
    args: [],
    returnType: "bool",
    description: "Checks if the Expert Advisor is allowed to trade and trading context is not busy",
  },
  IsTradeContextBusy: {
    args: [],
    returnType: "bool",
    description: "Returns the information about trade context",
  },
  IsVisualMode: {
    args: [],
    returnType: "bool",
    description: "Checks if the Expert Advisor is tested in visual mode",
  },
  MQLInfoInteger: {
    args: [],
    returnType: "int",
    description: "Returns an integer value of a corresponding property of a running mql4 program",
  },
  MQLInfoString: {
    args: [{ name: "property_id", type: "int", optional: false }],
    returnType: "string",
    description: "Returns a string value of a corresponding property of a running mql4 program",
  },
  MQLSetInteger: {
    args: [],
    returnType: "void",
    description: "Sets the value of the MQL_CODEPAGE property in an MQL4 program environment",
  },
  Period: {
    args: [],
    returnType: "int",
    description: "Returns the current chart timeframe",
  },
  Point: {
    args: [],
    returnType: "double",
    description: "Returns the point size of the current symbol in the quote currency",
  },
  Symbol: {
    args: [],
    returnType: "string",
    description: "Returns the name of a symbol of the current chart",
  },
  TerminalCompany: {
    args: [],
    returnType: "string",
    description: "Returns the name of company owning the client terminal",
  },
  TerminalInfoDouble: {
    args: [],
    returnType: "double",
    description: "Returns an double value of a corresponding property of a running mql4 program",
  },
  TerminalInfoInteger: {
    args: [{ name: "property_id", type: "int", optional: false }],
    returnType: "int",
    description: "Returns an integer value of a corresponding property of a running mql4 program",
  },
  TerminalInfoString: {
    args: [],
    returnType: "string",
    description: "Returns a string value of a corresponding property of a running mql4 program",
  },
  TerminalName: {
    args: [],
    returnType: "string",
    description: "Returns client terminal name",
  },
  TerminalPath: {
    args: [],
    returnType: "string",
    description: "Returns the directory, from which the client terminal was launched",
  },
  UninitializeReason: {
    args: [],
    returnType: "int",
    description: "Returns the code of the reason for deinitialization",
  },
};
