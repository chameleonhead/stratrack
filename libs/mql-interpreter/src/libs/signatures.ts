export interface FunctionArg {
  name: string;
  type: string;
  optional?: boolean;
  variadic?: boolean;
}

export interface FunctionSignature {
  args: FunctionArg[];
  returnType: string;
  description: string;
}

export type BuiltinSignaturesMap = Record<string, FunctionSignature | FunctionSignature[]>;

// https://docs.mql4.com/account
const accountBuiltinSignatures: BuiltinSignaturesMap = {
  AccountBalance: {
    args: [],
    returnType: "double",
    description: "Returns balance value of the current account",
  },
  AccountCompany: {
    args: [],
    returnType: "string",
    description: "Returns the brokerage company name where the current account was registered",
  },
  AccountCredit: {
    args: [],
    returnType: "double",
    description: "Returns credit value of the current account",
  },
  AccountCurrency: {
    args: [],
    returnType: "string",
    description: "Returns currency name of the current account",
  },
  AccountEquity: {
    args: [],
    returnType: "double",
    description: "Returns equity value of the current account",
  },
  AccountFreeMargin: {
    args: [],
    returnType: "double",
    description: "Returns free margin value of the current account",
  },
  AccountFreeMarginCheck: {
    args: [
      { name: "symbol", type: "string" }, // symbol
      { name: "cmd", type: "int" }, // trade operation
      { name: "volume", type: "double" }, // volume
    ],
    returnType: "double",
    description:
      "Returns free margin that remains after the specified position has been opened at the current price on the current account",
  },
  AccountFreeMarginMode: {
    args: [],
    returnType: "int",
    description: "Calculation mode of free margin allowed to open orders on the current account",
  },
  AccountInfoDouble: {
    args: [
      { name: "property_id", type: "int" }, // identifier of the property
    ],
    returnType: "double",
    description: "Returns a value of double type of the corresponding account property",
  },
  AccountInfoInteger: {
    args: [
      { name: "property_id", type: "int" }, // identifier of the property
    ],
    returnType: "long",
    description:
      "Returns a value of integer type (bool, int or long) of the corresponding account property",
  },
  AccountInfoString: {
    args: [
      { name: "property_id", type: "int" }, // identifier of the property
    ],
    returnType: "string",
    description: "Returns a value string type corresponding account property",
  },
  AccountLeverage: {
    args: [],
    returnType: "int",
    description: "Returns leverage of the current account",
  },
  AccountMargin: {
    args: [],
    returnType: "double",
    description: "Returns margin value of the current account",
  },
  AccountName: {
    args: [],
    returnType: "string",
    description: "Returns the current account name",
  },
  AccountNumber: {
    args: [],
    returnType: "long",
    description: "Returns the current account number",
  },
  AccountProfit: {
    args: [],
    returnType: "double",
    description: "Returns profit value of the current account",
  },
  AccountServer: {
    args: [],
    returnType: "string",
    description: "Returns the connected server name",
  },
  AccountStopoutLevel: {
    args: [],
    returnType: "int",
    description: "Returns the value of the Stop Out level",
  },
  AccountStopoutMode: {
    args: [],
    returnType: "int",
    description: "Returns the calculation mode for the Stop Out level",
    // Returned value
    // Returns the calculation mode for the Stop Out level.
    // Calculation mode can take the following values:
    // 0 - calculation of percentage ratio between margin and equity;
    // 1 - comparison of the free margin level to the absolute value.
  },
};

// https://docs.mql4.com/array
const arrayBuiltinSignatures: BuiltinSignaturesMap = {
  ArrayBsearch: {
    args: [
      { name: "array", type: "any[]" },
      { name: "value", type: "double" },
      { name: "count", type: "int", optional: true },
      { name: "start", type: "int", optional: true },
      { name: "direction", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Returns index of the first found element in the first array dimension",
  },
  ArrayCompare: {
    args: [
      { name: "array1", type: "any[]" },
      { name: "array2", type: "any[]" },
      { name: "count", type: "int", optional: true },
      { name: "start1", type: "int", optional: true },
      { name: "start2", type: "int", optional: true },
    ],
    returnType: "int",
    description:
      "Returns the result of comparing two arrays of simple types or custom structures without complex objects",
  },
  ArrayCopy: [
    {
      args: [
        { name: "dest", type: "any[]" },
        { name: "src", type: "any[]" },
      ],
      returnType: "int",
      description: "Copies one array into another",
    },
    {
      args: [
        { name: "dest", type: "any[]" },
        { name: "src", type: "any[]" },
        { name: "destStart", type: "int" },
        { name: "srcStart", type: "int" },
        { name: "count", type: "int" },
      ],
      returnType: "int",
      description: "Copies one array into another",
    },
  ],
  ArrayCopyRates: {
    args: [
      { name: "dest", type: "MqlRates[]" },
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int", optional: true },
      { name: "startPos", type: "int", optional: true },
      { name: "count", type: "int", optional: true },
    ],
    returnType: "int",
    description:
      "Copies rates to the two-dimensional array from chart RateInfo array returns copied bars amount",
  },
  ArrayCopySeries: {
    args: [
      { name: "dest", type: "any[]" },
      { name: "seriesIndex", type: "int" },
      { name: "symbol", type: "string", optional: true },
      { name: "timeframe", type: "int", optional: true },
    ],
    returnType: "int",
    description:
      "Copies a series array to another one and returns the count of the copied elements",
  },
  ArrayDimension: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "int",
    description: "Returns the multidimensional array rank",
  },
  ArrayFill: {
    args: [
      { name: "array", type: "any[]" },
      { name: "value", type: "double" },
      { name: "start", type: "int", optional: true },
      { name: "count", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Fills an array with the specified value",
  },
  ArrayFree: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "int",
    description:
      "Frees up buffer of any dynamic array and sets the size of the zero dimension in 0.",
  },
  ArrayGetAsSeries: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "int",
    description: "Checks direction of array indexing",
  },
  ArrayInitialize: {
    args: [
      { name: "array", type: "any[]" },
      { name: "value", type: "double" },
    ],
    returnType: "int",
    description: "Sets all elements of a numeric array into a single value",
  },
  ArrayIsDynamic: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "bool",
    description: "Checks whether an array is dynamic",
  },
  ArrayIsSeries: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "bool",
    description: "Checks whether an array is a timeseries",
  },
  ArrayMaximum: {
    args: [
      { name: "array", type: "double[]" },
      { name: "count", type: "int", optional: true },
      { name: "start", type: "int", optional: true },
    ],
    returnType: "double",
    description: "Search for an element with the maximal value",
  },
  ArrayMinimum: {
    args: [
      { name: "array", type: "double[]" },
      { name: "count", type: "int", optional: true },
      { name: "start", type: "int", optional: true },
    ],
    returnType: "double",
    description: "Search for an element with the minimal value",
  },
  ArrayRange: {
    args: [
      { name: "array", type: "any[]" },
      { name: "index", type: "int" },
    ],
    returnType: "int",
    description: "Returns the number of elements in the specified dimension of the array",
  },
  ArrayResize: {
    args: [
      { name: "array", type: "any[]" },
      { name: "newSize", type: "int" },
      { name: "reserveSize", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Sets the new size in the first dimension of the array",
  },
  ArraySetAsSeries: {
    args: [
      { name: "array", type: "any[]" },
      { name: "asSeries", type: "bool" },
    ],
    returnType: "int",
    description: "Sets the direction of array indexing",
  },
  ArraySize: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "int",
    description: "Returns the number of elements in the array",
  },
  ArraySort: {
    args: [
      { name: "array", type: "any[]" },
      { name: "count", type: "int", optional: true },
      { name: "start", type: "int", optional: true },
      { name: "sortDir", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Sorting of numeric arrays by the first dimension",
  },
};

// https://docs.mql4.com/chart_operations
const chartOperationsBuiltinSignatures: BuiltinSignaturesMap = {
  ChartApplyTemplate: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "filename", type: "string" },
    ],
    returnType: "bool",
    description: "Applies a specific template from a file to the chart",
  },
  ChartClose: {
    args: [{ name: "chart_id", type: "long", optional: true }],
    returnType: "bool",
    description: "Closes the specified chart",
  },
  ChartFirst: {
    args: [],
    returnType: "long",
    description: "Returns the ID of the first chart of the client terminal",
  },
  ChartGetDouble: [
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "prop_id", type: "int" },
        { name: "sub_window", type: "int", optional: true },
      ],
      returnType: "double",
      description: "Returns the double value property of the specified chart",
    },
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "prop_id", type: "int" },
        { name: "sub_window", type: "int" },
        { name: "double_var", type: "double" },
      ],
      returnType: "bool",
      description: "Retrieves a double chart property into a reference variable",
    },
  ],
  ChartGetInteger: [
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "prop_id", type: "int" },
        { name: "sub_window", type: "int", optional: true },
      ],
      returnType: "long",
      description: "Returns the integer value property of the specified chart",
    },
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "prop_id", type: "int" },
        { name: "sub_window", type: "int" },
        { name: "long_var", type: "long" },
      ],
      returnType: "bool",
      description: "Retrieves an integer chart property into a reference variable",
    },
  ],
  ChartGetString: [
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "prop_id", type: "int" },
        { name: "sub_window", type: "int", optional: true },
      ],
      returnType: "string",
      description: "Returns the string value property of the specified chart",
    },
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "prop_id", type: "int" },
        { name: "sub_window", type: "int" },
        { name: "string_var", type: "string" },
      ],
      returnType: "bool",
      description: "Retrieves a string chart property into a reference variable",
    },
  ],
  ChartID: {
    args: [],
    returnType: "long",
    description: "Returns the ID of the current chart",
  },
  ChartIndicatorDelete: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "window_index", type: "int" },
      { name: "indicator_shortname", type: "string" },
    ],
    returnType: "bool",
    description: "Removes an indicator with a specified name from the specified chart window",
  },
  ChartIndicatorName: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "window_index", type: "int" },
      { name: "index", type: "int" },
    ],
    returnType: "string",
    description:
      "Returns the short name of the indicator by the number in the indicators list on the specified chart window",
  },
  ChartIndicatorsTotal: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "window_index", type: "int" },
    ],
    returnType: "int",
    description: "Returns the number of all indicators applied to the specified chart window.",
  },
  ChartNavigate: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "position", type: "int" },
      { name: "shift", type: "int" },
    ],
    returnType: "bool",
    description:
      "Performs shift of the specified chart by the specified number of bars relative to the specified position in the chart",
  },
  ChartNext: {
    args: [{ name: "chart_id", type: "long" }],
    returnType: "long",
    description: "Returns the chart ID of the chart next to the specified one",
  },
  ChartOpen: {
    args: [
      { name: "symbol", type: "string" },
      { name: "period", type: "int" },
    ],
    returnType: "long",
    description: "Opens a new chart with the specified symbol and period",
  },
  ChartPeriod: {
    args: [{ name: "chart_id", type: "long", optional: true }],
    returnType: "int",
    description: "Returns the period value of the specified chart",
  },
  ChartPriceOnDropped: {
    args: [],
    returnType: "double",
    description:
      "Returns the price coordinate of the chart point, the Expert Advisor or script has been dropped to",
  },
  ChartRedraw: {
    args: [],
    returnType: "int",
    description: "Calls a forced redrawing of a specified chart",
  },
  ChartSaveTemplate: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "filename", type: "string" },
    ],
    returnType: "bool",
    description: "Saves current chart settings in a template with a specified name",
  },
  ChartScreenShot: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "filename", type: "string" },
      { name: "width", type: "int" },
      { name: "height", type: "int" },
      { name: "align_mode", type: "int", optional: true },
    ],
    returnType: "bool",
    description: "Provides a screenshot of the chart of its current state",
  },
  ChartSetDouble: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "prop_id", type: "int" },
      { name: "value", type: "double" },
    ],
    returnType: "bool",
    description: "Sets the double value for a corresponding property of the specified chart",
  },
  ChartSetInteger: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "prop_id", type: "int" },
      { name: "value", type: "long" },
    ],
    returnType: "bool",
    description:
      "Sets the integer value (datetime, int, color, bool or char) for a corresponding property of the specified chart",
  },
  ChartSetString: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "prop_id", type: "int" },
      { name: "value", type: "string" },
    ],
    returnType: "bool",
    description: "Sets the string value for a corresponding property of the specified chart",
  },
  ChartSetSymbolPeriod: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "symbol", type: "string" },
      { name: "period", type: "int" },
    ],
    returnType: "bool",
    description: "Changes the symbol value and a period of the specified chart",
  },
  ChartSymbol: {
    args: [{ name: "chart_id", type: "long", optional: true }],
    returnType: "string",
    description: "Returns the symbol name of the specified chart",
  },
  ChartTimeOnDropped: {
    args: [],
    returnType: "datetime",
    description:
      "Returns the time coordinate of the chart point, the Expert Advisor or script has been dropped to",
  },
  ChartTimePriceToXY: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "sub_window", type: "int" },
      { name: "time", type: "datetime" },
      { name: "price", type: "double" },
      { name: "x", type: "int" },
      { name: "y", type: "int" },
    ],
    returnType: "bool",
    description:
      "Converts the coordinates of a chart from the time/price representation to the X and Y coordinates",
  },
  ChartWindowFind: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "indicator_shortname", type: "string" },
    ],
    returnType: "int",
    description: "Returns the number of a subwindow where an indicator is drawn",
  },
  ChartWindowOnDropped: {
    args: [],
    returnType: "int",
    description:
      "Returns the number (index) of the chart subwindow, the Expert Advisor or script has been dropped to",
  },
  ChartXOnDropped: {
    args: [],
    returnType: "int",
    description:
      "Returns the X coordinate of the chart point, the Expert Advisor or script has been dropped to",
  },
  ChartXYToTimePrice: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "sub_window", type: "int" },
      { name: "x", type: "int" },
      { name: "y", type: "int" },
      { name: "time", type: "datetime" },
      { name: "price", type: "double" },
    ],
    returnType: "bool",
    description: "Converts the X and Y coordinates on a chart to the time and price values",
  },
  ChartYOnDropped: {
    args: [],
    returnType: "int",
    description:
      "Returns the Y coordinate of the chart point, the Expert Advisor or script has been dropped to",
  },
  Period: {
    args: [],
    returnType: "int",
    description: "Returns timeframe of the current chart",
  },
  Symbol: {
    args: [],
    returnType: "string",
    description: "Returns a text string with the name of the current financial instrument",
  },
  WindowBarsPerChart: {
    args: [],
    returnType: "int",
    description: "Returns the amount of bars visible on the chart",
  },
  WindowExpertName: {
    args: [],
    returnType: "string",
    description:
      "Returns the name of the executed Expert Advisor, script, custom indicator, or library",
  },
  WindowFind: {
    args: [],
    returnType: "int",
    description: "Returns the window index containing this specified indicator",
  },
  WindowFirstVisibleBar: {
    args: [],
    returnType: "int",
    description: "Returns index of the first visible bar in the current chart window",
  },
  WindowHandle: {
    args: [],
    returnType: "int",
    description: "Returns the system handle of the chart window",
  },
  WindowIsVisible: {
    args: [],
    returnType: "bool",
    description: "Returns the visibility flag of the chart subwindow",
  },
  WindowOnDropped: {
    args: [],
    returnType: "int",
    description:
      "Returns the window index where Expert Advisor, custom indicator or script was dropped",
  },
  WindowPriceMax: {
    args: [],
    returnType: "double",
    description:
      "Returns the maximal value of the vertical scale of the specified subwindow of the current chart",
  },
  WindowPriceMin: {
    args: [],
    returnType: "double",
    description:
      "Returns the minimal value of the vertical scale of the specified subwindow of the current chart",
  },
  WindowPriceOnDropped: {
    args: [],
    returnType: "double",
    description: "Returns the price of the chart point where Expert Advisor or script was dropped",
  },
  WindowRedraw: {
    args: [],
    returnType: "void",
    description: "Redraws the current chart forcedly",
  },
  WindowScreenShot: {
    args: [],
    returnType: "void",
    description:
      "Saves current chart screen shot as a GIF, PNG or BMP file depending on specified extension",
  },
  WindowsTotal: {
    args: [],
    returnType: "int",
    description: "Returns total number of indicator windows on the chart",
  },
  WindowTimeOnDropped: {
    args: [],
    returnType: "datetime",
    description: "Returns the time of the chart point where Expert Advisor or script was dropped",
  },
  WindowXOnDropped: {
    args: [],
    returnType: "int",
    description:
      "Returns the value at X axis in pixels for the chart window client area point at which the Expert Advisor or script was dropped",
  },
  WindowYOnDropped: {
    args: [],
    returnType: "int",
    description:
      "Returns the value at Y axis in pixels for the chart window client area point at which the Expert Advisor or script was dropped",
  },
};

// https://docs.mql4.com/check
const checkBuiltinSignatures: BuiltinSignaturesMap = {
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
    args: [],
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
    args: [],
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

// https://docs.mql4.com/common
const commonBuiltinSignatures: BuiltinSignaturesMap = {
  Alert: {
    args: [],
    returnType: "void",
    description: "Displays a message in a separate window",
  },
  CheckPointer: {
    args: [],
    returnType: "int",
    description: "Returns the type of the object pointer",
  },
  Comment: {
    args: [],
    returnType: "void",
    description: "Outputs a comment in the left top corner of the chart",
  },
  CryptDecode: {
    args: [],
    returnType: "void",
    description: "Performs the inverse transformation of the data from array",
  },
  CryptEncode: {
    args: [],
    returnType: "void",
    description: "Transforms the data from array with the specified method",
  },
  DebugBreak: {
    args: [],
    returnType: "void",
    description: "Program breakpoint in debugging",
  },
  ExpertRemove: {
    args: [],
    returnType: "void",
    description: "Stops Expert Advisor and unloads it from the chart",
  },
  GetPointer: {
    args: [],
    returnType: "int",
    description: "Returns the object pointer",
  },
  GetTickCount: {
    args: [],
    returnType: "long",
    description:
      "Returns the number of milliseconds that have elapsed since the system was started",
  },
  GetTickCount64: {
    args: [],
    returnType: "long",
    description:
      "Returns the number of milliseconds that have elapsed since the system was started (64-bit)",
  },
  GetMicrosecondCount: {
    args: [],
    returnType: "long",
    description: "Returns the number of microseconds that have elapsed since the terminal start",
  },
  MessageBox: {
    args: [],
    returnType: "int",
    description: "Creates, displays a message box and manages it",
  },
  PeriodSeconds: {
    args: [],
    returnType: "int",
    description: "Returns the number of seconds in the period",
  },
  PlaySound: {
    args: [{ name: "filename", type: "string", optional: false }],
    returnType: "bool",
    description: "Plays a sound file",
  },
  Print: {
    args: [{ name: "message", type: "string", optional: false }],
    returnType: "void",
    description: "Displays a message in the log",
  },
  PrintFormat: {
    args: [{ name: "format", type: "string", optional: false }],
    returnType: "void",
    description:
      "Formats and prints the sets of symbols and values in a log file in accordance with a preset format",
  },
  ResetLastError: {
    args: [],
    returnType: "void",
    description: "Sets the value of a predetermined variable _LastError to zero",
  },
  ResourceCreate: {
    args: [],
    returnType: "int",
    description: "Creates an image resource based on a data set",
  },
  ResourceFree: {
    args: [],
    returnType: "void",
    description: "Deletes dynamically created resource (freeing the memory allocated for it)",
  },
  ResourceReadImage: {
    args: [],
    returnType: "void",
    description:
      "Reads data from the graphical resource created by ResourceCreate() function or saved in EX4 file during compilation",
  },
  ResourceSave: {
    args: [],
    returnType: "void",
    description: "Saves a resource into the specified file",
  },
  SendFTP: {
    args: [],
    returnType: "void",
    description: "Sends a file at the address specified in the settings window of the 'FTP' tab",
  },
  SendMail: {
    args: [],
    returnType: "void",
    description:
      "Sends an email at the address specified in the settings window of the 'Email' tab",
  },
  SendNotification: {
    args: [],
    returnType: "void",
    description:
      "Sends push notifications to mobile terminals, whose MetaQuotes ID are specified in the 'Notifications' tab",
  },
  Sleep: {
    args: [{ name: "duration", type: "int", optional: false }],
    returnType: "void",
    description:
      "Suspends execution of the current Expert Advisor or script within a specified interval",
  },
  TerminalClose: {
    args: [],
    returnType: "void",
    description: "Commands the terminal to complete operation",
  },
  TesterStatistics: {
    args: [],
    returnType: "void",
    description:
      "It returns the value of a specified statistic calculated based on testing results",
  },
  WebRequest: {
    args: [],
    returnType: "void",
    description: "Sends HTTP request to the specified server",
  },
  ZeroMemory: {
    args: [{ name: "variable", type: "any", optional: false }],
    returnType: "void",
    description:
      "Resets a variable passed to it by reference. The variable can be of any type, except for classes and structures that have constructors.",
  },
};

// https://docs.mql4.com/convert
const convertBuiltinSignatures: BuiltinSignaturesMap = {
  CharArrayToString: {
    args: [{ name: "array", type: "char[]", optional: false }],
    returnType: "string",
    description: "Converting symbol code (ansi) into one-symbol array",
  },
  CharToStr: {
    args: [{ name: "char", type: "char", optional: false }],
    returnType: "string",
    description: "Conversion of the symbol code into a one-character string",
  },
  CharToString: {
    args: [{ name: "char", type: "char", optional: false }],
    returnType: "string",
    description: "Converting a symbol code into a one-character string",
  },
  ColorToARGB: {
    args: [{ name: "color", type: "color", optional: false }],
    returnType: "uint",
    description: "Converting color type to uint type to receive ARGB representation of the color.",
  },
  ColorToString: {
    args: [{ name: "color", type: "color", optional: false }],
    returnType: "string",
    description: 'Converting color value into string as "R,G,B"',
  },
  DoubleToStr: {
    args: [{ name: "value", type: "double", optional: false }],
    returnType: "string",
    description:
      "Returns text string with the specified numerical value converted into a specified precision format",
  },
  DoubleToString: {
    args: [{ name: "value", type: "double", optional: false }],
    returnType: "string",
    description: "Converting a numeric value to a text line with a specified accuracy",
  },
  EnumToString: {
    args: [{ name: "enum", type: "enum", optional: false }],
    returnType: "string",
    description: "Converting an enumeration value of any type to string",
  },
  IntegerToString: {
    args: [{ name: "value", type: "int", optional: false }],
    returnType: "string",
    description: "Converting int into a string of preset length",
  },
  NormalizeDouble: {
    args: [{ name: "value", type: "double", optional: false }],
    returnType: "double",
    description: "Rounding of a floating point number to a specified accuracy",
  },
  ShortArrayToString: {
    args: [{ name: "array", type: "short[]", optional: false }],
    returnType: "string",
    description: "Copying array part into a string",
  },
  ShortToString: {
    args: [{ name: "short", type: "short", optional: false }],
    returnType: "string",
    description: "Converting symbol code (unicode) into one-symbol string",
  },
  StringFormat: {
    args: [{ name: "value", type: "double", optional: false }],
    returnType: "string",
    description: "Converting number into string according to preset format",
  },
  StringToCharArray: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "uchar[]",
    description:
      "Symbol-wise copying a string converted from Unicode to ANSI, to a selected place of array of uchar type",
  },
  StringToColor: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "color",
    description: 'Converting "R,G,B" string or string with color name into color type value',
  },
  StringToDouble: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "double",
    description:
      "Converting a string containing a symbol representation of number into number of double type",
  },
  StringToInteger: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "int",
    description:
      "Converting a string containing a symbol representation of number into number of int type",
  },
  StringToShortArray: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "ushort[]",
    description: "Symbol-wise copying a string to a selected part of array of ushort type",
  },
  StringToTime: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "datetime",
    description:
      'Converting a string containing time or date in "yyyy.mm.dd [hh:mi]" format into datetime type',
  },
  StrToDouble: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "double",
    description: "Converts string representation of number to double type",
  },
  StrToInteger: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "int",
    description:
      "Converts string containing the value character representation into a value of the integer type",
  },
  StrToTime: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "datetime",
    description: 'Converts string in the format "yyyy.mm.dd hh:mi" to datetime type',
  },
  TimeToStr: {
    args: [{ name: "datetime", type: "datetime", optional: false }],
    returnType: "string",
    description: 'Converts value of datetime type into a string of "yyyy.mm.dd hh:mi" format',
  },
  TimeToString: {
    args: [{ name: "seconds", type: "int", optional: false }],
    returnType: "string",
    description:
      'Converting a value containing time in seconds elapsed since 01.01.1970 into a string of "yyyy.mm.dd hh:mi" format',
  },
};

// https://docs.mql4.com/customind
const customindBuiltinSignatures: BuiltinSignaturesMap = {
  HideTestIndicators: {
    args: [],
    returnType: "void",
    description: "The function sets a flag hiding indicators called by the Expert Advisor",
  },
  IndicatorBuffers: {
    args: [{ name: "count", type: "int", optional: false }],
    returnType: "void",
    description: "Allocates memory for buffers used for custom indicator calculations",
  },
  IndicatorCounted: {
    args: [],
    returnType: "int",
    description:
      "Returns the amount of bars not changed after the indicator had been launched last",
  },
  IndicatorDigits: {
    args: [{ name: "digits", type: "int", optional: false }],
    returnType: "void",
    description: "Sets precision format to visualize indicator values",
  },
  IndicatorSetDouble: {
    args: [
      { name: "prop", type: "int", optional: false },
      { name: "value", type: "double", optional: false },
    ],
    returnType: "void",
    description: "Sets the value of an indicator property of the double type",
  },
  IndicatorSetInteger: {
    args: [
      { name: "prop", type: "int", optional: false },
      { name: "value", type: "int", optional: false },
    ],
    returnType: "void",
    description: "Sets the value of an indicator property of the int type",
  },
  IndicatorSetString: {
    args: [
      { name: "prop", type: "int", optional: false },
      { name: "value", type: "string", optional: false },
    ],
    returnType: "void",
    description: "Sets the value of an indicator property of the string type",
  },
  IndicatorShortName: {
    args: [{ name: "name", type: "string", optional: false }],
    returnType: "void",
    description:
      "Sets the 'short' name of a custom indicator to be shown in the DataWindow and in the chart subwindow",
  },
  SetIndexArrow: {
    args: [
      { name: "index", type: "int", optional: false },
      { name: "arrow", type: "int", optional: false },
    ],
    returnType: "void",
    description: "Sets an arrow symbol for indicators line of the DRAW_ARROW type",
  },
  SetIndexBuffer: {
    args: [
      { name: "index", type: "int", optional: false },
      { name: "buffer", type: "double[]", optional: false },
    ],
    returnType: "void",
    description:
      "Binds the specified indicator buffer with one-dimensional dynamic array of the double type",
  },
  SetIndexDrawBegin: {
    args: [
      { name: "index", type: "int", optional: false },
      { name: "begin", type: "int", optional: false },
    ],
    returnType: "void",
    description:
      "Sets the bar number from which the drawing of the given indicator line must start",
  },
  SetIndexEmptyValue: {
    args: [
      { name: "index", type: "int", optional: false },
      { name: "value", type: "double", optional: false },
    ],
    returnType: "void",
    description: "Sets drawing line empty value",
  },
  SetIndexLabel: {
    args: [
      { name: "index", type: "int", optional: false },
      { name: "label", type: "string", optional: false },
    ],
    returnType: "void",
    description: "Sets drawing line description for showing in the DataWindow and in the tooltip",
  },
  SetIndexShift: {
    args: [
      { name: "index", type: "int", optional: false },
      { name: "shift", type: "int", optional: false },
    ],
    returnType: "void",
    description: "Sets offset for the drawing line",
  },
  SetIndexStyle: {
    args: [
      { name: "index", type: "int", optional: false },
      { name: "style", type: "int", optional: false },
      { name: "width", type: "int", optional: false },
      { name: "color", type: "int", optional: false },
    ],
    returnType: "void",
    description: "Sets the new type, style, width and color for a given indicator line",
  },
  SetLevelStyle: {
    args: [
      { name: "level", type: "int", optional: false },
      { name: "style", type: "int", optional: false },
      { name: "width", type: "int", optional: false },
      { name: "color", type: "int", optional: false },
    ],
    returnType: "void",
    description:
      "Sets a new style, width and color of horizontal levels of indicator to be output in a separate window",
  },
  SetLevelValue: {
    args: [
      { name: "level", type: "int", optional: false },
      { name: "value", type: "double", optional: false },
    ],
    returnType: "void",
    description:
      "Sets a value for a given horizontal level of the indicator to be output in a separate window",
  },
};

// https://docs.mql4.com/dateandtime
const dateandtimeBuiltinSignatures: BuiltinSignaturesMap = {
  Day: {
    args: [],
    returnType: "int",
    description:
      "Returns the current day of the month, i.e., the day of month of the last known server time",
  },
  DayOfWeek: {
    args: [],
    returnType: "int",
    description: "Returns the current zero-based day of the week of the last known server time",
  },
  DayOfYear: {
    args: [],
    returnType: "int",
    description:
      "Returns the current day of the year i.e., the day of year of the last known server time",
  },
  Hour: {
    args: [],
    returnType: "int",
    description:
      "Returns the hour of the last known server time by the moment of the program start",
  },
  Minute: {
    args: [],
    returnType: "int",
    description:
      "Returns the current minute of the last known server time by the moment of the program start",
  },
  Month: {
    args: [],
    returnType: "int",
    description:
      "Returns the current month as number, i.e., the number of month of the last known server time",
  },
  Seconds: {
    args: [],
    returnType: "int",
    description:
      "Returns the amount of seconds elapsed from the beginning of the current minute of the last known server time by the moment of the program start",
  },
  StructToTime: {
    args: [],
    returnType: "datetime",
    description: "Converts a variable of MqlDateTime structure type into a datetime value",
  },
  TimeCurrent: {
    args: [],
    returnType: "datetime",
    description:
      "Returns the last known server time (time of the last quote receipt) in the datetime format",
  },
  TimeDay: {
    args: [],
    returnType: "int",
    description: "Returns the day of month of the specified date",
  },
  TimeDaylightSavings: {
    args: [],
    returnType: "int",
    description: "Returns the sign of Daylight Saving Time switch",
  },
  TimeDayOfWeek: {
    args: [],
    returnType: "int",
    description: "Returns the zero-based day of week of the specified date",
  },
  TimeDayOfYear: {
    args: [],
    returnType: "int",
    description: "Returns the day of year of the specified date",
  },
  TimeGMT: {
    args: [],
    returnType: "datetime",
    description:
      "Returns GMT in datetime format with the Daylight Saving Time by local time of the computer, where the client terminal is running",
  },
  TimeGMTOffset: {
    args: [],
    returnType: "int",
    description:
      "Returns the current difference between GMT time and the local computer time in seconds, taking into account DST switch",
  },
  TimeHour: {
    args: [],
    returnType: "int",
    description: "Returns the hour of the specified time",
  },
  TimeLocal: {
    args: [],
    returnType: "datetime",
    description: "Returns the local computer time in datetime format",
  },
  TimeMinute: {
    args: [],
    returnType: "int",
    description: "Returns the minute of the specified time",
  },
  TimeMonth: {
    args: [],
    returnType: "int",
    description: "Returns the month number of the specified time",
  },
  TimeSeconds: {
    args: [],
    returnType: "int",
    description:
      "Returns the amount of seconds elapsed from the beginning of the minute of the specified time",
  },
  TimeToStruct: {
    args: [],
    returnType: "MqlDateTime",
    description: "Converts a datetime value into a variable of MqlDateTime structure type",
  },
  TimeYear: {
    args: [],
    returnType: "int",
    description: "Returns year of the specified date",
  },
  Year: {
    args: [],
    returnType: "int",
    description: "Returns the current year, i.e., the year of the last known server time",
  },
};

// https://docs.mql4.com/files
const filesBuiltinSignatures: BuiltinSignaturesMap = {
  FileClose: {
    args: [],
    returnType: "bool",
    description: "Closes a previously opened file",
  },
  FileCopy: {
    args: [],
    returnType: "bool",
    description: "Copies the original file from a local or shared folder to another file",
  },
  FileDelete: {
    args: [],
    returnType: "bool",
    description: "Deletes a specified file",
  },
  FileFindClose: {
    args: [],
    returnType: "bool",
    description: "Closes search handle",
  },
  FileFindFirst: {
    args: [],
    returnType: "int",
    description:
      "Starts the search of files in a directory in accordance with the specified filter",
  },
  FileFindNext: {
    args: [],
    returnType: "int",
    description: "Continues the search started by the FileFindFirst() function",
  },
  FileFlush: {
    args: [],
    returnType: "bool",
    description: "Writes to a disk all data remaining in the input/output file buffer",
  },
  FileGetInteger: {
    args: [],
    returnType: "int",
    description: "Gets an integer property of a file",
  },
  FileIsEnding: {
    args: [],
    returnType: "bool",
    description: "Defines the end of a file in the process of reading",
  },
  FileIsExist: {
    args: [],
    returnType: "bool",
    description: "Checks the existence of a file",
  },
  FileIsLineEnding: {
    args: [],
    returnType: "bool",
    description: "Defines the end of a line in a text file in the process of reading",
  },
  FileMove: {
    args: [],
    returnType: "bool",
    description: "Moves or renames a file",
  },
  FileOpen: {
    args: [],
    returnType: "bool",
    description: "Opens a file with a specified name and flag",
  },
  FileOpenHistory: {
    args: [],
    returnType: "bool",
    description: "Opens file in the current history directory or in its subfolders",
  },
  FileReadArray: {
    args: [],
    returnType: "bool",
    description: "Reads arrays of any type except for string from the file of the BIN type",
  },
  FileReadBool: {
    args: [],
    returnType: "bool",
    description:
      "Reads from the file of the CSV type a string from the current position till a delimiter (or till the end of a text line) and converts the read string to a value of bool type",
  },
  FileReadDatetime: {
    args: [],
    returnType: "datetime",
    description:
      'Reads from the file of the CSV type a string of one of the formats: "YYYY.MM.DD HH:MM:SS", "YYYY.MM.DD" or "HH:MM:SS" - and converts it into a datetime value',
  },
  FileReadDouble: {
    args: [],
    returnType: "double",
    description: "Reads a double value from the current position of the file pointer",
  },
  FileReadFloat: {
    args: [],
    returnType: "float",
    description: "Reads a float value from the current position of the file pointer",
  },
  FileReadInteger: {
    args: [],
    returnType: "int",
    description: "Reads int, short or char value from the current position of the file pointer",
  },
  FileReadLong: {
    args: [],
    returnType: "long",
    description: "Reads a long type value from the current position of the file pointer",
  },
  FileReadNumber: {
    args: [],
    returnType: "double",
    description:
      "Reads from the file of the CSV type a string from the current position till a delimiter (or til the end of a text line) and converts the read string into double value",
  },
  FileReadString: {
    args: [],
    returnType: "string",
    description: "Reads a string from the current position of a file pointer from a file",
  },
  FileReadStruct: {
    args: [],
    returnType: "bool",
    description:
      "Reads the contents from a binary file  into a structure passed as a parameter, from the current position of the file pointer",
  },
  FileSeek: {
    args: [],
    returnType: "bool",
    description:
      "Moves the position of the file pointer by a specified number of bytes relative to the specified position",
  },
  FileSize: {
    args: [],
    returnType: "long",
    description: "Returns the size of a corresponding open file",
  },
  FileTell: {
    args: [],
    returnType: "long",
    description: "Returns the current position of the file pointer of a corresponding open file",
  },
  FileWrite: {
    args: [],
    returnType: "bool",
    description: "Writes data to a file of CSV or TXT type",
  },
  FileWriteArray: {
    args: [],
    returnType: "bool",
    description: "Writes arrays of any type except for string into a file of BIN type",
  },
  FileWriteDouble: {
    args: [],
    returnType: "bool",
    description:
      "Writes value of the double type from the current position of a file pointer into a binary file",
  },
  FileWriteFloat: {
    args: [],
    returnType: "bool",
    description:
      "Writes value of the float type from the current position of a file pointer into a binary file",
  },
  FileWriteInteger: {
    args: [],
    returnType: "bool",
    description:
      "Writes value of the int type from the current position of a file pointer into a binary file",
  },
  FileWriteLong: {
    args: [],
    returnType: "bool",
    description:
      "Writes value of the long type from the current position of a file pointer into a binary file",
  },
  FileWriteString: {
    args: [],
    returnType: "bool",
    description:
      "Writes the value of a string parameter into a BIN or TXT file starting from the current position of the file pointer",
  },
  FileWriteStruct: {
    args: [],
    returnType: "bool",
    description:
      "Writes the contents of a structure passed as a parameter into a binary file, starting from the current position of the file pointer",
  },
  FolderClean: {
    args: [],
    returnType: "bool",
    description: "Deletes all files in the specified folder",
  },
  FolderCreate: {
    args: [],
    returnType: "bool",
    description: "Creates a folder in the Files directory",
  },
  FolderDelete: {
    args: [],
    returnType: "bool",
    description:
      "Removes a selected directory. If the folder is not empty, then it can't be removed",
  },
};

// https://docs.mql4.com/globals
const globalsBuiltinSignatures: BuiltinSignaturesMap = {
  GlobalVariableCheck: {
    args: [{ name: "name", type: "string" }],
    returnType: "bool",
    description: "Checks the existence of a global variable with the specified name",
  },
  GlobalVariableDel: {
    args: [{ name: "name", type: "string" }],
    returnType: "bool",
    description: "Deletes a global variable",
  },
  GlobalVariableGet: [
    {
      args: [{ name: "name", type: "string" }],
      returnType: "double",
      description: "Returns the value of a global variable",
    },
    {
      args: [
        { name: "name", type: "string" },
        { name: "double_var", type: "double" },
      ],
      returnType: "bool",
      description: "Copies the value of a global variable into the provided variable",
    },
  ],
  GlobalVariableName: {
    args: [{ name: "index", type: "int" }],
    returnType: "string",
    description:
      "Returns the name of a global variable by it's ordinal number in the list of global variables",
  },
  GlobalVariablesDeleteAll: {
    args: [
      { name: "prefix_name", type: "string", optional: true },
      { name: "limit_data", type: "datetime", optional: true },
    ],
    returnType: "int",
    description: "Deletes global variables with the specified prefix in their names",
  },
  GlobalVariableSet: {
    args: [
      { name: "name", type: "string" },
      { name: "value", type: "double" },
    ],
    returnType: "datetime",
    description: "Sets the new value to a global variable",
  },
  GlobalVariableSetOnCondition: {
    args: [
      { name: "name", type: "string" },
      { name: "value", type: "double" },
      { name: "check_value", type: "double" },
    ],
    returnType: "bool",
    description: "Sets the new value of the existing global variable by condition",
  },
  GlobalVariablesFlush: {
    args: [],
    returnType: "void",
    description: "Forcibly saves contents of all global variables to a disk",
  },
  GlobalVariablesTotal: {
    args: [],
    returnType: "int",
    description: "Returns the total number of global variables",
  },
  GlobalVariableTemp: {
    args: [{ name: "name", type: "string" }],
    returnType: "bool",
    description:
      "Sets the new value to a global variable, that exists only in the current session of the terminal",
  },
  GlobalVariableTime: {
    args: [{ name: "name", type: "string" }],
    returnType: "datetime",
    description: "Returns time of the last accessing the global variable",
  },
};

// https://docs.mql4.com/marketinformation
const marketinformationBuiltinSignatures: BuiltinSignaturesMap = {
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
      { name: "session_index", type: "uint" },
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
      { name: "session_index", type: "uint" },
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

// https://docs.mql4.com/math
const mathBuiltinSignatures: BuiltinSignaturesMap = {
  acos: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the arc cosine of x in radians",
  },
  asin: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the arc sine of x in radians",
  },
  atan: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the arc tangent of x in radians",
  },
  ceil: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns integer numeric value closest from above",
  },
  cos: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the cosine of a number",
  },
  exp: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns exponent of a number",
  },
  fabs: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns absolute value (modulus) of the specified numeric value",
  },
  floor: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns integer numeric value closest from below",
  },
  fmax: {
    args: [
      { name: "x", type: "double" },
      { name: "y", type: "double" },
    ],
    returnType: "double",
    description: "Returns the maximal value of the two numeric values",
  },
  fmin: {
    args: [
      { name: "x", type: "double" },
      { name: "y", type: "double" },
    ],
    returnType: "double",
    description: "Returns the minimal value of the two numeric values",
  },
  fmod: {
    args: [
      { name: "x", type: "double" },
      { name: "y", type: "double" },
    ],
    returnType: "double",
    description: "Returns the real remainder after the division of two numbers",
  },
  log: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns natural logarithm",
  },
  log10: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the logarithm of a number by base 10",
  },
  MathAbs: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns absolute value (modulus) of the specified numeric value",
  },
  MathArccos: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the arc cosine of x in radians",
  },
  MathArcsin: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the arc sine of x in radians",
  },
  MathArctan: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the arc tangent of x in radians",
  },
  MathCeil: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns integer numeric value closest from above",
  },
  MathCos: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the cosine of a number",
  },
  MathExp: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns exponent of a number",
  },
  MathFloor: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns integer numeric value closest from below",
  },
  MathIsValidNumber: {
    args: [{ name: "value", type: "double" }],
    returnType: "bool",
    description: "Checks the correctness of a real number",
  },
  MathLog: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns natural logarithm",
  },
  MathLog10: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the logarithm of a number by base 10",
  },
  MathMax: {
    args: [
      { name: "value1", type: "double" },
      { name: "value2", type: "double" },
    ],
    returnType: "double",
    description: "Returns the maximal value of the two numeric values",
  },
  MathMin: {
    args: [
      { name: "value1", type: "double" },
      { name: "value2", type: "double" },
    ],
    returnType: "double",
    description: "Returns the minimal value of the two numeric values",
  },
  MathMod: {
    args: [
      { name: "value1", type: "double" },
      { name: "value2", type: "double" },
    ],
    returnType: "double",
    description: "Returns the real remainder after the division of two numbers",
  },
  MathPow: {
    args: [
      { name: "base", type: "double" },
      { name: "exponent", type: "double" },
    ],
    returnType: "double",
    description: "Raises the base to the specified power",
  },
  MathRand: {
    args: [],
    returnType: "double",
    description: "Returns a pseudorandom value within the range of 0 to 32767",
  },
  MathRound: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Rounds of a value to the nearest integer",
  },
  MathSin: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the sine of a number",
  },
  MathSqrt: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns a square root",
  },
  MathSrand: {
    args: [{ name: "seed", type: "int" }],
    returnType: "void",
    description: "Sets the starting point for generating a series of pseudorandom integers",
  },
  MathTan: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the tangent of a number",
  },
  pow: {
    args: [
      { name: "base", type: "double" },
      { name: "exponent", type: "double" },
    ],
    returnType: "double",
    description: "Raises the base to the specified power",
  },
  rand: {
    args: [],
    returnType: "double",
    description: "Returns a pseudorandom value within the range of 0 to 32767",
  },
  round: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Rounds of a value to the nearest integer",
  },
  sin: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the sine of a number",
  },
  sqrt: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns a square root",
  },
  srand: {
    args: [{ name: "seed", type: "int" }],
    returnType: "void",
    description: "Sets the starting point for generating a series of pseudorandom integers",
  },
  tan: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the tangent of a number",
  },
};

// https://docs.mql4.com/objects
const objectsBuilinSignatures: BuiltinSignaturesMap = {
  ObjectCreate: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "object_type", type: "int" },
      { name: "sub_window", type: "int" },
      { name: "time1", type: "datetime" },
      { name: "price1", type: "double" },
      { name: "time2", type: "datetime", optional: true },
      { name: "price2", type: "double", optional: true },
      { name: "time3", type: "datetime", optional: true },
      { name: "price3", type: "double", optional: true },
    ],
    returnType: "bool",
    description: "Creates an object of the specified type in a specified chart",
  },
  ObjectDelete: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
    ],
    returnType: "bool",
    description: "Removes the object having the specified name",
  },
  ObjectDescription: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
    ],
    returnType: "string",
    description: "Returns the object description",
  },
  ObjectFind: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
    ],
    returnType: "int",
    description: "Searches for an object having the specified name",
  },
  ObjectGet: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "index", type: "int" },
    ],
    returnType: "double",
    description: "Returns the value of the specified object property",
  },
  ObjectGetDouble: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "prop_id", type: "int" },
      { name: "prop_modifier", type: "int", optional: true },
    ],
    returnType: "double",
    description: "Returns the double value of the corresponding object property",
  },
  ObjectGetFiboDescription: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "index", type: "int" },
    ],
    returnType: "string",
    description: "Returns the level description of a Fibonacci object",
  },
  ObjectGetInteger: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "prop_id", type: "int" },
      { name: "prop_modifier", type: "int", optional: true },
    ],
    returnType: "long",
    description: "Returns the integer value of the corresponding object property",
  },
  ObjectGetShiftByValue: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "value", type: "double" },
    ],
    returnType: "int",
    description: "Calculates and returns bar index for the given price",
  },
  ObjectGetString: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "prop_id", type: "int" },
      { name: "prop_modifier", type: "int", optional: true },
    ],
    returnType: "string",
    description: "Returns the string value of the corresponding object property",
  },
  ObjectGetTimeByValue: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "value", type: "double" },
      { name: "line_id", type: "int", optional: true },
    ],
    returnType: "datetime",
    description: "Returns the time value for the specified object price value",
  },
  ObjectGetValueByShift: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "shift", type: "int" },
    ],
    returnType: "double",
    description: "Calculates and returns the price value for the specified bar",
  },
  ObjectGetValueByTime: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "time", type: "datetime" },
      { name: "line_id", type: "int", optional: true },
    ],
    returnType: "double",
    description: "Returns the price value of an object for the specified time",
  },
  ObjectMove: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "point_index", type: "int" },
      { name: "time", type: "datetime" },
      { name: "price", type: "double" },
    ],
    returnType: "bool",
    description: "Changes the coordinates of the specified object anchor point",
  },
  ObjectName: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "index", type: "int" },
    ],
    returnType: "string",
    description: "Returns the name of an object by its index in the objects list",
  },
  ObjectsDeleteAll: [
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "sub_window", type: "int", optional: true },
        { name: "object_type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Removes all objects of the specified type from the specified chart subwindow",
    },
    {
      args: [
        { name: "sub_window", type: "int", optional: true },
        { name: "object_type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Removes all objects of the specified type from the specified chart subwindow",
    },
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "prefix", type: "string" },
        { name: "sub_window", type: "int", optional: true },
        { name: "object_type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Removes all objects of the specified type from the specified chart subwindow",
    },
    {
      args: [
        { name: "prefix", type: "string" },
        { name: "sub_window", type: "int", optional: true },
        { name: "object_type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Removes all objects of the specified type from the specified chart subwindow",
    },
  ],
  ObjectSet: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "index", type: "int" },
      { name: "value", type: "double" },
    ],
    returnType: "bool",
    description: "Changes the value of the specified object property",
  },
  ObjectSetDouble: [
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "value", type: "double" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "prop_modifier", type: "int" },
        { name: "value", type: "double" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
  ],
  ObjectSetFiboDescription: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "index", type: "int" },
      { name: "text", type: "string" },
    ],
    returnType: "bool",
    description: "Sets a new description to a level of a Fibonacci object",
  },
  ObjectSetInteger: [
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "value", type: "long" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "prop_modifier", type: "int" },
        { name: "value", type: "long" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
  ],
  ObjectSetString: [
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "value", type: "string" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "prop_modifier", type: "int" },
        { name: "value", type: "string" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
  ],
  ObjectSetText: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "text", type: "string" },
      { name: "font_size", type: "int", optional: true },
      { name: "font_name", type: "string", optional: true },
      { name: "text_color", type: "color", optional: true },
    ],
    returnType: "bool",
    description: "Changes the object description",
  },
  ObjectsTotal: [
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "sub_window", type: "int", optional: true },
        { name: "type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Returns the number of objects of the specified type",
    },
    {
      args: [{ name: "type", type: "int", optional: true }],
      returnType: "int",
      description: "Returns the number of objects of the specified type",
    },
  ],
  ObjectType: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
    ],
    returnType: "int",
    description: "Returns the object type",
  },
  TextGetSize: {
    args: [
      { name: "text", type: "string" },
      { name: "width", type: "uint" },
      { name: "height", type: "uint" },
    ],
    returnType: "bool",
    description: "Returns the string's width and height at the current font settings",
  },
  TextOut: {
    args: [
      { name: "text", type: "string" },
      { name: "x", type: "int" },
      { name: "y", type: "int" },
      { name: "anchor", type: "uint" },
      { name: "data", type: "uint[]" },
      { name: "width", type: "uint" },
      { name: "height", type: "uint" },
      { name: "color", type: "uint" },
      { name: "color_format", type: "int" },
    ],
    returnType: "bool",
    description:
      "Transfers the text to the custom array (buffer) designed for creation of a graphical resource",
  },
  TextSetFont: {
    args: [
      { name: "name", type: "string" },
      { name: "size", type: "int" },
      { name: "flags", type: "uint", optional: true },
      { name: "orientation", type: "int", optional: true },
    ],
    returnType: "bool",
    description:
      "Sets the font for displaying the text using drawing methods (Arial 20 used by default)",
  },
};

// https://docs.mql4.com/strings
const stringsBuiltinSignatures: BuiltinSignaturesMap = {
  StringAdd: {
    args: [
      { name: "string_var", type: "string" },
      { name: "add_substring", type: "string" },
    ],
    returnType: "bool",
    description: "Adds a string to the end of another string",
  },
  StringBufferLen: {
    args: [{ name: "string_var", type: "string" }],
    returnType: "int",
    description: "Returns the size of buffer allocated for the string",
  },
  StringCompare: {
    args: [
      { name: "string1", type: "string" },
      { name: "string2", type: "string" },
      { name: "case_sensitive", type: "bool", optional: true },
    ],
    returnType: "int",
    description:
      "Compares two strings and returns 1 if the first string is greater than the second; 0 - if the strings are equal; -1 (minus 1) - if the first string is less than the second one",
  },
  StringConcatenate: {
    args: [
      { name: "first", type: "any" },
      { name: "args", type: "any", variadic: true },
    ],
    returnType: "string",
    description: "Forms a string of parameters passed",
  },
  StringFill: {
    args: [
      { name: "string_var", type: "string" },
      { name: "character", type: "ushort" },
    ],
    returnType: "bool",
    description: "Fills out a specified string by selected symbols",
  },
  StringFind: {
    args: [
      { name: "string_value", type: "string" },
      { name: "match_substring", type: "string" },
      { name: "start_pos", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Search for a substring in a string",
  },
  StringGetChar: {
    args: [
      { name: "string_value", type: "string" },
      { name: "pos", type: "int" },
    ],
    returnType: "ushort",
    description: "Returns character (code) from the specified position in the string",
  },
  StringGetCharacter: {
    args: [
      { name: "string_value", type: "string" },
      { name: "pos", type: "int" },
    ],
    returnType: "ushort",
    description: "Returns the value of a number located in the specified string position",
  },
  StringInit: {
    args: [
      { name: "string_var", type: "string" },
      { name: "len", type: "int" },
      { name: "character", type: "ushort" },
    ],
    returnType: "bool",
    description: "Initializes string by specified symbols and provides the specified string length",
  },
  StringLen: {
    args: [{ name: "string_var", type: "string" }],
    returnType: "int",
    description: "Returns the number of symbols in a string",
  },
  StringReplace: {
    args: [
      { name: "str", type: "string" },
      { name: "find", type: "string" },
      { name: "replacement", type: "string" },
    ],
    returnType: "int",
    description: "Replaces all the found substrings of a string by a set sequence of symbols",
  },
  StringSetChar: {
    args: [
      { name: "string_var", type: "string" },
      { name: "pos", type: "int" },
      { name: "value", type: "ushort" },
    ],
    returnType: "string",
    description: "Returns the string copy with changed character in the specified position",
  },
  StringSetCharacter: {
    args: [
      { name: "string_var", type: "string" },
      { name: "pos", type: "int" },
      { name: "character", type: "ushort" },
    ],
    returnType: "bool",
    description: "Returns true is a symbol is successfully inserted to the passed string.",
  },
  StringSplit: {
    args: [
      { name: "string_value", type: "string" },
      { name: "separator", type: "ushort" },
      { name: "result", type: "string[]" },
    ],
    returnType: "int",
    description:
      "Gets substrings by a specified separator from the specified string, returns the number of substrings obtained",
  },
  StringSubstr: {
    args: [
      { name: "string_value", type: "string" },
      { name: "start_pos", type: "int" },
      { name: "length", type: "int", optional: true },
    ],
    returnType: "string",
    description: "Extracts a substring from a text string starting from a specified position",
  },
  StringToLower: {
    args: [{ name: "string_var", type: "string" }],
    returnType: "bool",
    description: "Transforms all symbols of a selected string to lowercase by location",
  },
  StringToUpper: {
    args: [{ name: "string_var", type: "string" }],
    returnType: "bool",
    description: "Transforms all symbols of a selected string into capitals by location",
  },
  StringTrimLeft: {
    args: [{ name: "text", type: "string" }],
    returnType: "string",
    description: "Cuts line feed characters, spaces and tabs in the left part of the string",
  },
  StringTrimRight: {
    args: [{ name: "text", type: "string" }],
    returnType: "string",
    description: "Cuts line feed characters, spaces and tabs in the right part of the string",
  },
};

// https://docs.mql4.com/indicators
const indicatorsBuiltinSignatures: BuiltinSignaturesMap = {
  iAC: {
    args: [],
    returnType: "void",
    description: "Accelerator Oscillator",
  },
  iAD: {
    args: [],
    returnType: "void",
    description: "Accumulation/Distribution",
  },
  iADX: {
    args: [],
    returnType: "void",
    description: "Average Directional Index",
  },
  iAlligator: {
    args: [],
    returnType: "void",
    description: "Alligator",
  },
  iAO: {
    args: [],
    returnType: "void",
    description: "Awesome Oscillator",
  },
  iATR: {
    args: [],
    returnType: "void",
    description: "Average True Range",
  },
  iBands: {
    args: [],
    returnType: "void",
    description: "Bollinger Bands®",
  },
  iBandsOnArray: {
    args: [],
    returnType: "void",
    description: "Calculation of Bollinger Bands® indicator on data, stored in a numeric array",
  },
  iBearsPower: {
    args: [],
    returnType: "void",
    description: "Bears Power",
  },
  iBullsPower: {
    args: [],
    returnType: "void",
    description: "Bulls Power",
  },
  iBWMFI: {
    args: [],
    returnType: "void",
    description: "Market Facilitation Index by Bill Williams",
  },
  iCCI: {
    args: [],
    returnType: "void",
    description: "Commodity Channel Index",
  },
  iCCIOnArray: {
    args: [],
    returnType: "void",
    description:
      "Calculation of Commodity Channel Index indicator on data, stored in a numeric array",
  },
  iCustom: {
    args: [],
    returnType: "void",
    description: "Custom indicator",
  },
  iDeMarker: {
    args: [],
    returnType: "void",
    description: "DeMarker",
  },
  iEnvelopes: {
    args: [],
    returnType: "void",
    description: "Envelopes",
  },
  iEnvelopesOnArray: {
    args: [],
    returnType: "void",
    description: "Calculation of Envelopes indicator on data, stored in a numeric array",
  },
  iForce: {
    args: [],
    returnType: "void",
    description: "Force Index",
  },
  iFractals: {
    args: [],
    returnType: "void",
    description: "Fractals",
  },
  iGator: {
    args: [],
    returnType: "void",
    description: "Gator Oscillator",
  },
  iIchimoku: {
    args: [],
    returnType: "void",
    description: "Ichimoku Kinko Hyo",
  },
  iMA: {
    args: [],
    returnType: "void",
    description: "Moving Average",
  },
  iMACD: {
    args: [],
    returnType: "void",
    description: "Moving Averages Convergence-Divergence",
  },
  iMAOnArray: {
    args: [],
    returnType: "void",
    description: "Calculation of Moving Average indicator on data, stored in a numeric array",
  },
  iMFI: {
    args: [],
    returnType: "void",
    description: "Money Flow Index",
  },
  iMomentum: {
    args: [],
    returnType: "void",
    description: "Momentum",
  },
  iMomentumOnArray: {
    args: [],
    returnType: "void",
    description: "Calculation of Momentum indicator on data, stored in a numeric array",
  },
  iOBV: {
    args: [],
    returnType: "void",
    description: "On Balance Volume",
  },
  iOsMA: {
    args: [],
    returnType: "void",
    description: "Moving Average of Oscillator (MACD histogram)",
  },
  iRSI: {
    args: [],
    returnType: "void",
    description: "Relative Strength Index",
  },
  iRSIOnArray: {
    args: [],
    returnType: "void",
    description: "Calculation of Momentum indicator on data, stored in a numeric array",
  },
  iRVI: {
    args: [],
    returnType: "void",
    description: "Relative Vigor Index",
  },
  iSAR: {
    args: [],
    returnType: "void",
    description: "Parabolic Stop And Reverse System",
  },
  iStdDev: {
    args: [],
    returnType: "void",
    description: "Standard Deviation",
  },
  iStdDevOnArray: {
    args: [],
    returnType: "void",
    description: "Calculation of Standard Deviation indicator on data, stored in a numeric array",
  },
  iStochastic: {
    args: [],
    returnType: "void",
    description: "Stochastic Oscillator",
  },
  iWPR: {
    args: [],
    returnType: "void",
    description: "Williams' Percent Range",
  },
};

// https://docs.mql4.com/series
const seriesBuiltinSignatures: BuiltinSignaturesMap = {
  Bars: {
    args: [],
    returnType: "int",
    description:
      "Returns the number of bars count in the history for a specified symbol and period",
  },
  CopyClose: {
    args: [],
    returnType: "void",
    description:
      "Gets history data on bar closing price for a specified symbol and period into an array",
  },
  CopyHigh: {
    args: [],
    returnType: "void",
    description:
      "Gets history data on maximal bar price for a specified symbol and period into an array",
  },
  CopyLow: {
    args: [],
    returnType: "void",
    description:
      "Gets history data on minimal bar price for a specified symbol and period into an array",
  },
  CopyOpen: {
    args: [],
    returnType: "void",
    description:
      "Gets history data on bar opening price for a specified symbol and period into an array",
  },
  CopyRates: {
    args: [],
    returnType: "void",
    description:
      "Gets history data of the Rates structure for a specified symbol and period into an array",
  },
  CopyTickVolume: {
    args: [],
    returnType: "void",
    description:
      "Gets history data on tick volumes for a specified symbol and period into an array",
  },
  CopyTime: {
    args: [],
    returnType: "void",
    description:
      "Gets history data on bar opening time for a specified symbol and period into an array",
  },
  iBars: {
    args: [],
    returnType: "int",
    description: "Returns the number of bars on the specified chart",
  },
  iBarShift: {
    args: [],
    returnType: "int",
    description: "Returns the index of the bar which covers the specified time",
  },
  iClose: {
    args: [],
    returnType: "double",
    description:
      "Returns Close price value for the bar of specified symbol with timeframe and shift",
  },
  iHigh: {
    args: [],
    returnType: "double",
    description:
      "Returns High price value for the bar of specified symbol with timeframe and shift",
  },
  iHighest: {
    args: [],
    returnType: "int",
    description: "Returns the shift of the maximum value over a specific number of bars",
  },
  iLow: {
    args: [],
    returnType: "double",
    description: "Returns Low price value for the bar of indicated symbol with timeframe and shift",
  },
  iLowest: {
    args: [],
    returnType: "int",
    description: "Returns the shift of the lowest value over a specific number of bars",
  },
  iOpen: {
    args: [],
    returnType: "double",
    description:
      "Returns Open price value for the bar of specified symbol with timeframe and shift",
  },
  iTime: {
    args: [],
    returnType: "datetime",
    description: "Returns time value for the bar of specified symbol with timeframe and shift",
  },
  iVolume: {
    args: [],
    returnType: "long",
    description:
      "Returns Tick Volume value for the bar of specified symbol with timeframe and shift",
  },
  RefreshRates: {
    args: [],
    returnType: "void",
    description: "Refreshing of data in pre-defined variables and series arrays",
  },
  SeriesInfoInteger: {
    args: [],
    returnType: "int",
    description: "Returns information about the state of historical data",
  },
};

// https://docs.mql4.com/trading
const tradingBuiltinSignatures: BuiltinSignaturesMap = {
  OrderClose: {
    args: [
      { name: "ticket", type: "int" },
      { name: "lots", type: "double" },
      { name: "price", type: "double" },
      { name: "slippage", type: "int", optional: true },
      { name: "arrowColor", type: "color", optional: true },
    ],
    returnType: "bool",
    description: "Closes opened order",
  },
  OrderCloseBy: {
    args: [],
    returnType: "void",
    description: "Closes an opened order by another opposite opened order",
  },
  OrderClosePrice: {
    args: [],
    returnType: "double",
    description: "Returns close price of the currently selected order",
  },
  OrderCloseTime: {
    args: [],
    returnType: "datetime",
    description: "Returns close time of the currently selected order",
  },
  OrderComment: {
    args: [],
    returnType: "string",
    description: "Returns comment of the currently selected order",
  },
  OrderCommission: {
    args: [],
    returnType: "double",
    description: "Returns calculated commission of the currently selected order",
  },
  OrderDelete: {
    args: [],
    returnType: "void",
    description: "Deletes previously opened pending order",
  },
  OrderExpiration: {
    args: [],
    returnType: "datetime",
    description: "Returns expiration date of the selected pending order",
  },
  OrderLots: {
    args: [],
    returnType: "double",
    description: "Returns amount of lots of the selected order",
  },
  OrderMagicNumber: {
    args: [],
    returnType: "int",
    description: "Returns an identifying (magic) number of the currently selected order",
  },
  OrderModify: {
    args: [],
    returnType: "void",
    description: "Modification of characteristics of the previously opened or pending orders",
  },
  OrderOpenPrice: {
    args: [],
    returnType: "double",
    description: "Returns open price of the currently selected order",
  },
  OrderOpenTime: {
    args: [],
    returnType: "datetime",
    description: "Returns open time of the currently selected order",
  },
  OrderPrint: {
    args: [],
    returnType: "void",
    description: "Prints information about the selected order in the log",
  },
  OrderProfit: {
    args: [],
    returnType: "double",
    description: "Returns profit of the currently selected order",
  },
  OrderSelect: {
    args: [],
    returnType: "bool",
    description: "The function selects an order for further processing",
  },
  OrderSend: {
    args: [
      { name: "symbol", type: "string" },
      { name: "cmd", type: "int" },
      { name: "volume", type: "double" },
      { name: "price", type: "double" },
      { name: "slippage", type: "int" },
      { name: "stoploss", type: "double" },
      { name: "takeprofit", type: "double" },
      { name: "comment", type: "string", optional: true },
      { name: "magic", type: "int", optional: true },
      { name: "expiration", type: "datetime", optional: true },
      { name: "arrowColor", type: "color", optional: true },
    ],
    returnType: "int",
    description: "The main function used to open an order or place a pending order",
  },
  OrdersHistoryTotal: {
    args: [],
    returnType: "int",
    description:
      "Returns the number of closed orders in the account history loaded into the terminal",
  },
  OrderStopLoss: {
    args: [],
    returnType: "double",
    description: "Returns stop loss value of the currently selected order",
  },
  OrdersTotal: {
    args: [],
    returnType: "int",
    description: "Returns the number of market and pending orders",
  },
  OrderSwap: {
    args: [],
    returnType: "double",
    description: "Returns swap value of the currently selected order",
  },
  OrderSymbol: {
    args: [],
    returnType: "string",
    description: "Returns symbol name of the currently selected order",
  },
  OrderTakeProfit: {
    args: [],
    returnType: "double",
    description: "Returns take profit value of the currently selected order",
  },
  OrderTicket: {
    args: [],
    returnType: "int",
    description: "Returns ticket number of the currently selected order",
  },
  OrderType: {
    args: [],
    returnType: "int",
    description: "Returns order operation type of the currently selected order",
  },
};

// https://docs.mql4.com/signals
const signalsBuiltinSignatures: BuiltinSignaturesMap = {
  SignalBaseGetDouble: {
    args: [{ name: "property_id", type: "int" }],
    returnType: "double",
    description: "Returns the value of double type property for selected signal",
  },
  SignalBaseGetInteger: {
    args: [{ name: "property_id", type: "int" }],
    returnType: "long",
    description: "Returns the value of integer type property for selected signal",
  },
  SignalBaseGetString: {
    args: [{ name: "property_id", type: "int" }],
    returnType: "string",
    description: "Returns the value of string type property for selected signal",
  },
  SignalBaseSelect: {
    args: [{ name: "index", type: "int" }],
    returnType: "bool",
    description: "Selects a signal from signals, available in terminal for further working with it",
  },
  SignalBaseTotal: {
    args: [],
    returnType: "int",
    description: "Returns the total amount of signals, available in terminal",
  },
  SignalInfoGetDouble: {
    args: [{ name: "property_id", type: "int" }],
    returnType: "double",
    description: "Returns the value of double type property of signal copy settings",
  },
  SignalInfoGetInteger: {
    args: [{ name: "property_id", type: "int" }],
    returnType: "long",
    description: "Returns the value of integer type property of signal copy settings",
  },
  SignalInfoGetString: {
    args: [{ name: "property_id", type: "int" }],
    returnType: "string",
    description: "Returns the value of string type property of signal copy settings",
  },
  SignalInfoSetDouble: {
    args: [
      { name: "property_id", type: "int" },
      { name: "value", type: "double" },
    ],
    returnType: "bool",
    description: "Sets the value of double type property of signal copy settings",
  },
  SignalInfoSetInteger: {
    args: [
      { name: "property_id", type: "int" },
      { name: "value", type: "long" },
    ],
    returnType: "bool",
    description: "Sets the value of integer type property of signal copy settings",
  },
  SignalSubscribe: {
    args: [{ name: "signal_id", type: "long" }],
    returnType: "bool",
    description: "Subscribes to the trading signal",
  },
  SignalUnsubscribe: {
    args: [],
    returnType: "bool",
    description: "Cancels subscription",
  },
};

// https://docs.mql4.com/eventfunctions
const eventfunctionsBuiltinSignatures: BuiltinSignaturesMap = {
  EventChartCustom: {
    args: [
      { name: "chart_id", type: "long" },
      { name: "custom_event_id", type: "ushort" },
      { name: "lparam", type: "long" },
      { name: "dparam", type: "double" },
      { name: "sparam", type: "string" },
    ],
    returnType: "bool",
    description: "Generates a custom event for the specified chart",
  },
  EventKillTimer: {
    args: [],
    returnType: "void",
    description: "Stops the generation of events by the timer in the current chart",
  },
  EventSetMillisecondTimer: {
    args: [{ name: "milliseconds", type: "int" }],
    returnType: "void",
    description:
      "Launches event generator of the high-resolution timer with a period less than 1 second for the current chart",
  },
  EventSetTimer: {
    args: [{ name: "seconds", type: "int" }],
    returnType: "void",
    description:
      "Starts the timer event generator with the specified periodicity for the current chart",
  },
};

export const builtinSignatures: BuiltinSignaturesMap = {
  ...accountBuiltinSignatures,
  ...arrayBuiltinSignatures,
  ...chartOperationsBuiltinSignatures,
  ...checkBuiltinSignatures,
  ...commonBuiltinSignatures,
  ...convertBuiltinSignatures,
  ...customindBuiltinSignatures,
  ...dateandtimeBuiltinSignatures,
  ...filesBuiltinSignatures,
  ...globalsBuiltinSignatures,
  ...marketinformationBuiltinSignatures,
  ...mathBuiltinSignatures,
  ...objectsBuilinSignatures,
  ...stringsBuiltinSignatures,
  ...indicatorsBuiltinSignatures,
  ...seriesBuiltinSignatures,
  ...tradingBuiltinSignatures,
  ...signalsBuiltinSignatures,
  ...eventfunctionsBuiltinSignatures,
};
