import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/customind
export const customindBuiltinSignatures: BuiltinSignaturesMap = {
  HideTestIndicators: {
    args: [{ name: "hide", type: "bool", optional: true }],
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
