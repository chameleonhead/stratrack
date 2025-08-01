export interface BuiltinParam {
  type: string;
  optional?: boolean;
}

export interface BuiltinSignature {
  parameters: BuiltinParam[];
  variadic?: boolean;
}

export type BuiltinSignaturesMap = Record<string, BuiltinSignature | BuiltinSignature[]>;

export const builtinSignatures: BuiltinSignaturesMap = {
  Print: { parameters: [], variadic: true },
  Alert: { parameters: [], variadic: true },
  Comment: { parameters: [], variadic: true },
  PrintFormat: { parameters: [{ type: "string" }], variadic: true },
  GetTickCount: { parameters: [] },
  GetTickCount64: { parameters: [] },
  GetMicrosecondCount: { parameters: [] },
  Sleep: { parameters: [{ type: "int" }] },
  PlaySound: { parameters: [{ type: "string" }] },
  SendMail: {
    parameters: [{ type: "string" }, { type: "string" }, { type: "string" }],
  },
  SendNotification: { parameters: [{ type: "string" }] },
  SendFTP: { parameters: [{ type: "string" }, { type: "string" }] },
  TerminalClose: { parameters: [] },
  ExpertRemove: { parameters: [] },
  DebugBreak: { parameters: [] },
  MessageBox: {
    parameters: [
      { type: "string" },
      { type: "string", optional: true },
      { type: "int", optional: true },
    ],
  },
  StringTrimLeft: { parameters: [{ type: "string" }] },
  StringTrimRight: { parameters: [{ type: "string" }] },
  StringLen: { parameters: [{ type: "string" }] },
  StringSubstr: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "int", optional: true }],
  },
  StringAdd: {
    parameters: [{ type: "string" }, { type: "string" }],
  },
  StringBufferLen: { parameters: [{ type: "string" }] },
  StringCompare: {
    parameters: [{ type: "string" }, { type: "string" }, { type: "bool", optional: true }],
  },
  StringConcatenate: { parameters: [], variadic: true },
  StringFill: {
    parameters: [{ type: "string" }, { type: "int" }],
  },
  StringFind: {
    parameters: [{ type: "string" }, { type: "string" }, { type: "int", optional: true }],
  },
  StringGetChar: {
    parameters: [{ type: "string" }, { type: "int" }],
  },
  StringSetChar: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "int" }],
  },
  StringInit: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "int", optional: true }],
  },
  StringReplace: {
    parameters: [{ type: "string" }, { type: "string" }, { type: "string" }],
  },
  StringSplit: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "string[]", optional: true }],
  },
  StringToLower: { parameters: [{ type: "string" }] },
  StringToUpper: { parameters: [{ type: "string" }] },
  StringGetCharacter: {
    parameters: [{ type: "string" }, { type: "int" }],
  },
  StringSetCharacter: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "int" }],
  },
  CharToString: { parameters: [{ type: "char" }] },
  CharToStr: { parameters: [{ type: "char" }] },
  StringToTime: { parameters: [{ type: "string" }] },
  TimeToString: { parameters: [{ type: "int" }] },
  TimeToStr: { parameters: [{ type: "int" }] },
  NormalizeDouble: {
    parameters: [{ type: "double" }, { type: "int" }],
  },
  DoubleToString: {
    parameters: [{ type: "double" }, { type: "int", optional: true }],
  },
  DoubleToStr: {
    parameters: [{ type: "double" }, { type: "int", optional: true }],
  },
  IntegerToString: {
    parameters: [{ type: "int" }, { type: "int", optional: true }],
  },
  StringToDouble: { parameters: [{ type: "string" }] },
  StrToDouble: { parameters: [{ type: "string" }] },
  StringToInteger: {
    parameters: [{ type: "string" }, { type: "int", optional: true }],
  },
  StrToInteger: {
    parameters: [{ type: "string" }, { type: "int", optional: true }],
  },
  StringFormat: { parameters: [{ type: "string" }], variadic: true },
  StringToCharArray: {
    parameters: [
      { type: "string" },
      { type: "int[]", optional: true },
      { type: "int", optional: true },
      { type: "int", optional: true },
    ],
  },
  CharArrayToString: {
    parameters: [
      { type: "int[]" },
      { type: "int", optional: true },
      { type: "int", optional: true },
    ],
  },
  ArrayCopy: [
    {
      parameters: [{ type: "any[]" }, { type: "any[]" }],
    },
    {
      parameters: [{ type: "any[]" }, { type: "any[]" }, { type: "int" }, { type: "int" }],
    },
  ],
  ArrayResize: {
    parameters: [{ type: "any[]" }, { type: "int" }, { type: "any", optional: true }],
  },
  ArraySetAsSeries: {
    parameters: [{ type: "any[]" }, { type: "bool" }],
  },
  ArrayGetAsSeries: { parameters: [{ type: "any[]" }] },
  ArrayIsSeries: { parameters: [{ type: "any[]" }] },
  ArrayIsDynamic: { parameters: [{ type: "any[]" }] },
  ArraySize: { parameters: [{ type: "any[]" }] },
  ArrayRange: {
    parameters: [{ type: "any[]" }, { type: "int" }],
  },
  ArrayDimension: { parameters: [{ type: "any[]" }] },
  ArrayFree: { parameters: [{ type: "any[]" }] },
  ArrayInitialize: {
    parameters: [{ type: "any[]" }, { type: "any" }],
  },
  ArrayFill: {
    parameters: [{ type: "any[]" }, { type: "int" }, { type: "int" }, { type: "any" }],
  },
  ArraySort: {
    parameters: [{ type: "any[]" }, { type: "int", optional: true }],
  },
  ArrayMaximum: {
    parameters: [
      { type: "number[]" },
      { type: "int", optional: true },
      { type: "int", optional: true },
    ],
  },
  ArrayMinimum: {
    parameters: [
      { type: "number[]" },
      { type: "int", optional: true },
      { type: "int", optional: true },
    ],
  },
  ArrayBsearch: {
    parameters: [
      { type: "number[]" },
      { type: "number" },
      { type: "int", optional: true },
      { type: "int", optional: true },
    ],
  },
  ArrayCompare: {
    parameters: [
      { type: "any[]" },
      { type: "any[]" },
      { type: "int", optional: true },
      { type: "int", optional: true },
      { type: "int", optional: true },
    ],
  },
  MathAbs: { parameters: [{ type: "double" }] },
  MathArccos: { parameters: [{ type: "double" }] },
  MathArcsin: { parameters: [{ type: "double" }] },
  MathArctan: { parameters: [{ type: "double" }] },
  MathCeil: { parameters: [{ type: "double" }] },
  MathCos: { parameters: [{ type: "double" }] },
  MathExp: { parameters: [{ type: "double" }] },
  MathFloor: { parameters: [{ type: "double" }] },
  MathLog: { parameters: [{ type: "double" }] },
  MathLog10: { parameters: [{ type: "double" }] },
  MathMax: { parameters: [{ type: "double" }, { type: "double" }] },
  MathMin: { parameters: [{ type: "double" }, { type: "double" }] },
  MathMod: { parameters: [{ type: "double" }, { type: "double" }] },
  MathPow: { parameters: [{ type: "double" }, { type: "double" }] },
  MathRand: { parameters: [] },
  MathRound: { parameters: [{ type: "double" }] },
  MathSin: { parameters: [{ type: "double" }] },
  MathSqrt: { parameters: [{ type: "double" }] },
  MathSrand: { parameters: [{ type: "int" }] },
  MathTan: { parameters: [{ type: "double" }] },
  MathIsValidNumber: { parameters: [{ type: "double" }] },
  Day: { parameters: [{ type: "datetime", optional: true }] },
  DayOfWeek: { parameters: [{ type: "datetime", optional: true }] },
  DayOfYear: { parameters: [{ type: "datetime", optional: true }] },
  Hour: { parameters: [{ type: "datetime", optional: true }] },
  Minute: { parameters: [{ type: "datetime", optional: true }] },
  Month: { parameters: [{ type: "datetime", optional: true }] },
  Seconds: { parameters: [{ type: "datetime", optional: true }] },
  Year: { parameters: [{ type: "datetime", optional: true }] },
  TimeCurrent: { parameters: [] },
  TimeLocal: { parameters: [] },
  TimeGMT: { parameters: [] },
  TimeDaylightSavings: { parameters: [] },
  TimeGMTOffset: { parameters: [] },
  TimeToStruct: { parameters: [{ type: "datetime" }] },
  StructToTime: { parameters: [{ type: "object" }] },
  TimeDay: { parameters: [{ type: "datetime" }] },
  TimeDayOfWeek: { parameters: [{ type: "datetime" }] },
  TimeDayOfYear: { parameters: [{ type: "datetime" }] },
  TimeHour: { parameters: [{ type: "datetime" }] },
  TimeMinute: { parameters: [{ type: "datetime" }] },
  TimeMonth: { parameters: [{ type: "datetime" }] },
  TimeSeconds: { parameters: [{ type: "datetime" }] },
  TimeYear: { parameters: [{ type: "datetime" }] },
  GlobalVariableSet: {
    parameters: [{ type: "string" }, { type: "double" }],
  },
  GlobalVariableGet: { parameters: [{ type: "string" }] },
  GlobalVariableDel: { parameters: [{ type: "string" }] },
  GlobalVariableCheck: { parameters: [{ type: "string" }] },
  GlobalVariableTime: { parameters: [{ type: "string" }] },
  GlobalVariablesDeleteAll: {
    parameters: [{ type: "string", optional: true }],
  },
  GlobalVariablesTotal: { parameters: [] },
  GlobalVariableName: { parameters: [{ type: "int" }] },
  GlobalVariableTemp: {
    parameters: [{ type: "string" }, { type: "double" }],
  },
  GlobalVariableSetOnCondition: {
    parameters: [{ type: "string" }, { type: "double" }, { type: "double" }],
  },
  GlobalVariablesFlush: { parameters: [] },
  TerminalCompany: { parameters: [] },
  TerminalName: { parameters: [] },
  TerminalPath: { parameters: [] },
  IsTesting: { parameters: [] },
  IsOptimization: { parameters: [] },
  IsVisualMode: { parameters: [] },
  IsDemo: { parameters: [] },
  IsConnected: { parameters: [] },
  IsTradeAllowed: { parameters: [] },
  IsTradeContextBusy: { parameters: [] },
  UninitializeReason: { parameters: [] },
  WebRequest: {
    parameters: [
      { type: "string" },
      { type: "string" },
      { type: "string[]", optional: true },
      { type: "string", optional: true },
      { type: "int", optional: true },
      { type: "object", optional: true },
    ],
  },
  AccountBalance: { parameters: [] },
  AccountCompany: { parameters: [] },
  AccountCredit: { parameters: [] },
  AccountCurrency: { parameters: [] },
  AccountEquity: { parameters: [] },
  AccountFreeMargin: { parameters: [] },
  AccountFreeMarginCheck: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "double" }],
  },
  AccountFreeMarginMode: { parameters: [] },
  AccountInfoDouble: { parameters: [{ type: "int" }] },
  AccountInfoInteger: { parameters: [{ type: "int" }] },
  AccountInfoString: { parameters: [{ type: "int" }] },
  AccountLeverage: { parameters: [] },
  AccountMargin: { parameters: [] },
  AccountName: { parameters: [] },
  AccountNumber: { parameters: [] },
  AccountProfit: { parameters: [] },
  AccountServer: { parameters: [] },
  AccountStopoutLevel: { parameters: [] },
  AccountStopoutMode: { parameters: [] },
  OrderSend: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "double" },
      { type: "double" },
      { type: "double" },
      { type: "double" },
      { type: "double" },
      { type: "string", optional: true },
      { type: "int", optional: true },
      { type: "datetime", optional: true },
      { type: "color", optional: true },
    ],
  },
  OrderClose: {
    parameters: [
      { type: "int" },
      { type: "double" },
      { type: "double" },
      { type: "int", optional: true },
      { type: "color", optional: true },
    ],
  },
  OrderSelect: {
    parameters: [{ type: "int" }, { type: "int" }, { type: "int", optional: true }],
  },
  iMA: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
    ],
  },
  iMACD: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
    ],
  },
  iRSI: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
    ],
  },
  Bars: { parameters: [{ type: "string" }, { type: "int" }] },
  iBars: { parameters: [{ type: "string" }, { type: "int" }] },
  iBarShift: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "datetime" },
      { type: "bool", optional: true },
    ],
  },
  iOpen: { parameters: [{ type: "string" }, { type: "int" }, { type: "int" }] },
  iHigh: { parameters: [{ type: "string" }, { type: "int" }, { type: "int" }] },
  iLow: { parameters: [{ type: "string" }, { type: "int" }, { type: "int" }] },
  iClose: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "int" }],
  },
  iTime: { parameters: [{ type: "string" }, { type: "int" }, { type: "int" }] },
  iVolume: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "int" }],
  },
  CopyRates: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "any[]" },
    ],
  },
  CopyTime: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int[]" },
    ],
  },
  CopyOpen: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "double[]" },
    ],
  },
  CopyHigh: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "double[]" },
    ],
  },
  CopyLow: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "double[]" },
    ],
  },
  CopyClose: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "double[]" },
    ],
  },
  CopyTickVolume: {
    parameters: [
      { type: "string" },
      { type: "int" },
      { type: "int" },
      { type: "int" },
      { type: "int[]" },
    ],
  },
  SeriesInfoInteger: {
    parameters: [{ type: "string" }, { type: "int" }, { type: "int" }],
  },
  RefreshRates: { parameters: [] },
  IndicatorBuffers: { parameters: [{ type: "int" }] },
  SetIndexBuffer: {
    parameters: [{ type: "int" }, { type: "any[]" }],
  },
  SetIndexLabel: {
    parameters: [{ type: "int" }, { type: "string" }],
  },
  SetIndexShift: {
    parameters: [{ type: "int" }, { type: "int" }],
  },
  IndicatorCounted: { parameters: [] },
  IndicatorDigits: { parameters: [] },
  IndicatorSetDouble: { parameters: [{ type: "int" }, { type: "double" }] },
  IndicatorSetInteger: { parameters: [{ type: "int" }, { type: "int" }] },
  IndicatorSetString: { parameters: [{ type: "int" }, { type: "string" }] },
  IndicatorShortName: { parameters: [{ type: "string" }] },
};
