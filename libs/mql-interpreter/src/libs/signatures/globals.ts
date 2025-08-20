import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/globals
export const globalsBuiltinSignatures: BuiltinSignaturesMap = {
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
