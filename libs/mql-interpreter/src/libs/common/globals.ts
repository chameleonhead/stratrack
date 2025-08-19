import type { BuiltinFunction } from "./types";
import { getTerminal } from "./terminal";

const globalVars: Record<string, { value: number; time: number }> = {};

export const GlobalVariableSet: BuiltinFunction = (name: string, value: number) => {
  const term = getTerminal();
  if (term) return term.setGlobalVariable(name, value);
  globalVars[name] = { value, time: Math.floor(Date.now() / 1000) };
  return value;
};

export const GlobalVariableGet: BuiltinFunction = (name: string) => {
  const term = getTerminal();
  return term ? term.getGlobalVariable(name) : (globalVars[name]?.value ?? 0);
};

export const GlobalVariableDel: BuiltinFunction = (name: string) => {
  const term = getTerminal();
  if (term) return term.deleteGlobalVariable(name);
  const existed = name in globalVars;
  delete globalVars[name];
  return existed;
};

export const GlobalVariableCheck: BuiltinFunction = (name: string) => {
  const term = getTerminal();
  return term ? term.checkGlobalVariable(name) : name in globalVars;
};

export const GlobalVariableTime: BuiltinFunction = (name: string) => {
  const term = getTerminal();
  return term ? term.getGlobalVariableTime(name) : (globalVars[name]?.time ?? 0);
};

export const GlobalVariablesDeleteAll: BuiltinFunction = (prefix = "") => {
  const term = getTerminal();
  if (term) return term.deleteAllGlobalVariables(prefix);
  let count = 0;
  for (const k of Object.keys(globalVars)) {
    if (!prefix || k.startsWith(prefix)) {
      delete globalVars[k];
      count++;
    }
  }
  return count;
};

export const GlobalVariablesTotal: BuiltinFunction = () => {
  const term = getTerminal();
  return term ? term.globalVariablesTotal() : Object.keys(globalVars).length;
};

export const GlobalVariableName: BuiltinFunction = (index: number) => {
  const term = getTerminal();
  if (term) return term.getGlobalVariableName(index);
  const names = Object.keys(globalVars);
  return names[index] ?? "";
};

export const GlobalVariableTemp: BuiltinFunction = (name: string, value: number) =>
  GlobalVariableSet(name, value);

export const GlobalVariableSetOnCondition: BuiltinFunction = (
  name: string,
  value: number,
  check: number
) => {
  const term = getTerminal();
  if (term) return term.setGlobalVariableOnCondition(name, value, check);
  if (!globalVars[name] || globalVars[name].value === check) {
    globalVars[name] = { value, time: Math.floor(Date.now() / 1000) };
    return true;
  }
  return false;
};

export const GlobalVariablesFlush: BuiltinFunction = () => {
  const term = getTerminal();
  return term ? term.flushGlobalVariables() : 0;
};
