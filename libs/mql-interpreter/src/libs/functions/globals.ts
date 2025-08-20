import type { BuiltinFunction } from "./types";
import { getContext } from "./context";

export const GlobalVariableSet: BuiltinFunction = (name: string, value: number) => {
  const term = getContext().terminal;
  return term ? term.setGlobalVariable(name, value) : value;
};

export const GlobalVariableGet: BuiltinFunction = (name: string) => {
  const term = getContext().terminal;
  return term ? term.getGlobalVariable(name) : 0;
};

export const GlobalVariableDel: BuiltinFunction = (name: string) => {
  const term = getContext().terminal;
  return term ? term.deleteGlobalVariable(name) : false;
};

export const GlobalVariableCheck: BuiltinFunction = (name: string) => {
  const term = getContext().terminal;
  return term ? term.checkGlobalVariable(name) : false;
};

export const GlobalVariableTime: BuiltinFunction = (name: string) => {
  const term = getContext().terminal;
  return term ? term.getGlobalVariableTime(name) : 0;
};

export const GlobalVariablesDeleteAll: BuiltinFunction = (prefix = "") => {
  const term = getContext().terminal;
  return term ? term.deleteAllGlobalVariables(prefix) : 0;
};

export const GlobalVariablesTotal: BuiltinFunction = () => {
  const term = getContext().terminal;
  return term ? term.globalVariablesTotal() : 0;
};

export const GlobalVariableName: BuiltinFunction = (index: number) => {
  const term = getContext().terminal;
  return term ? term.getGlobalVariableName(index) : "";
};

export const GlobalVariableTemp: BuiltinFunction = (name: string, value: number) =>
  GlobalVariableSet(name, value);

export const GlobalVariableSetOnCondition: BuiltinFunction = (
  name: string,
  value: number,
  check: number
) => {
  const term = getContext().terminal;
  return term ? term.setGlobalVariableOnCondition(name, value, check) : false;
};

export const GlobalVariablesFlush: BuiltinFunction = () => {
  const term = getContext().terminal;
  return term ? term.flushGlobalVariables() : 0;
};
