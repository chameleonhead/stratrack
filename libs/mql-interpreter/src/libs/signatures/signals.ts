import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/signals
export const signalsBuiltinSignatures: BuiltinSignaturesMap = {
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
