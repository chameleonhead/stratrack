import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/eventfunctions
export const eventfunctionsBuiltinSignatures: BuiltinSignaturesMap = {
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
