import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/series
export const seriesBuiltinSignatures: BuiltinSignaturesMap = {
  Bars: {
    args: [
      { name: "symbol", type: "string", optional: true },
      { name: "timeframe", type: "int", optional: true },
    ],
    returnType: "int",
    description:
      "Returns the number of bars count in the history for a specified symbol and period",
  },
  CopyClose: [
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_pos", type: "int" },
        { name: "count", type: "int" },
        { name: "close_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar closing price for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "count", type: "int" },
        { name: "close_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar closing price for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "stop_time", type: "datetime" },
        { name: "close_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar closing price for a specified symbol and period into an array",
    },
  ],
  CopyHigh: [
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_pos", type: "int" },
        { name: "count", type: "int" },
        { name: "high_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on maximal bar price for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "count", type: "int" },
        { name: "high_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on maximal bar price for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "stop_time", type: "datetime" },
        { name: "high_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on maximal bar price for a specified symbol and period into an array",
    },
  ],
  CopyLow: [
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_pos", type: "int" },
        { name: "count", type: "int" },
        { name: "low_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on minimal bar price for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "count", type: "int" },
        { name: "low_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on minimal bar price for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "stop_time", type: "datetime" },
        { name: "low_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on minimal bar price for a specified symbol and period into an array",
    },
  ],
  CopyOpen: [
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_pos", type: "int" },
        { name: "count", type: "int" },
        { name: "open_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar opening price for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "count", type: "int" },
        { name: "open_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar opening price for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "stop_time", type: "datetime" },
        { name: "open_array", type: "double[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar opening price for a specified symbol and period into an array",
    },
  ],
  CopyRates: [
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_pos", type: "int" },
        { name: "count", type: "int" },
        { name: "rates_array", type: "MqlRates[]" },
      ],
      returnType: "int",
      description:
        "Gets history data of the Rates structure for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "count", type: "int" },
        { name: "rates_array", type: "MqlRates[]" },
      ],
      returnType: "int",
      description:
        "Gets history data of the Rates structure for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "stop_time", type: "datetime" },
        { name: "rates_array", type: "MqlRates[]" },
      ],
      returnType: "int",
      description:
        "Gets history data of the Rates structure for a specified symbol and period into an array",
    },
  ],
  CopyTickVolume: [
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_pos", type: "int" },
        { name: "count", type: "int" },
        { name: "volume_array", type: "long[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on tick volumes for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "count", type: "int" },
        { name: "volume_array", type: "long[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on tick volumes for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "stop_time", type: "datetime" },
        { name: "volume_array", type: "long[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on tick volumes for a specified symbol and period into an array",
    },
  ],
  CopyTime: [
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_pos", type: "int" },
        { name: "count", type: "int" },
        { name: "time_array", type: "datetime[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar opening time for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "count", type: "int" },
        { name: "time_array", type: "datetime[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar opening time for a specified symbol and period into an array",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "start_time", type: "datetime" },
        { name: "stop_time", type: "datetime" },
        { name: "time_array", type: "datetime[]" },
      ],
      returnType: "int",
      description:
        "Gets history data on bar opening time for a specified symbol and period into an array",
    },
  ],
  iBars: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
    ],
    returnType: "int",
    description: "Returns the number of bars on the specified chart",
  },
  iBarShift: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "time", type: "datetime" },
      { name: "exact", type: "bool", optional: true },
    ],
    returnType: "int",
    description: "Returns the index of the bar which covers the specified time",
  },
  iClose: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "shift", type: "int" },
    ],
    returnType: "double",
    description:
      "Returns Close price value for the bar of specified symbol with timeframe and shift",
  },
  iHigh: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "shift", type: "int" },
    ],
    returnType: "double",
    description:
      "Returns High price value for the bar of specified symbol with timeframe and shift",
  },
  iHighest: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "type", type: "int" },
      { name: "count", type: "int" },
      { name: "start", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Returns the shift of the maximum value over a specific number of bars",
  },
  iLow: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "shift", type: "int" },
    ],
    returnType: "double",
    description: "Returns Low price value for the bar of indicated symbol with timeframe and shift",
  },
  iLowest: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "type", type: "int" },
      { name: "count", type: "int" },
      { name: "start", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Returns the shift of the lowest value over a specific number of bars",
  },
  iOpen: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "shift", type: "int" },
    ],
    returnType: "double",
    description:
      "Returns Open price value for the bar of specified symbol with timeframe and shift",
  },
  iTime: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "shift", type: "int" },
    ],
    returnType: "datetime",
    description: "Returns time value for the bar of specified symbol with timeframe and shift",
  },
  iVolume: {
    args: [
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int" },
      { name: "shift", type: "int" },
    ],
    returnType: "long",
    description:
      "Returns Tick Volume value for the bar of specified symbol with timeframe and shift",
  },
  RefreshRates: {
    args: [],
    returnType: "bool",
    description: "Refreshing of data in pre-defined variables and series arrays",
  },
  SeriesInfoInteger: [
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "prop_id", type: "int" },
      ],
      returnType: "long",
      description: "Returns information about the state of historical data",
    },
    {
      args: [
        { name: "symbol", type: "string" },
        { name: "timeframe", type: "int" },
        { name: "prop_id", type: "int" },
        { name: "long_var", type: "long" },
      ],
      returnType: "bool",
      description: "Returns information about the state of historical data",
    },
  ],
};
