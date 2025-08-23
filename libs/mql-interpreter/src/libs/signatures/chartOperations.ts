import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/chart_operations
export const chartOperationsBuiltinSignatures: BuiltinSignaturesMap = {
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
  ChartRedraw: [
    {
      args: [],
      returnType: "int",
      description: "Calls a forced redrawing of the current chart",
    },
    {
      args: [{ name: "chart_id", type: "long", optional: false }],
      returnType: "int",
      description: "Calls a forced redrawing of a specified chart",
    },
  ],
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
    args: [
      { name: "filename", type: "string", optional: false },
      { name: "size_x", type: "int", optional: true },
      { name: "size_y", type: "int", optional: true },
      { name: "start_bar", type: "int", optional: true },
      { name: "chart_scale", type: "int", optional: true },
      { name: "chart_mode", type: "int", optional: true },
    ],
    returnType: "bool",
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
