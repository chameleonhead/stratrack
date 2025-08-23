import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createGlobals(context: ExecutionContext): Record<string, BuiltinFunction> {
  return {
    GlobalVariableSet: (name: string, value: number) => {
      const term = context.terminal;
      return term ? term.setGlobalVariable(name, value) : value;
    },

    GlobalVariableGet: (name: string) => {
      const term = context.terminal;
      return term ? term.getGlobalVariable(name) : 0;
    },

    GlobalVariableDel: (name: string) => {
      const term = context.terminal;
      return term ? term.deleteGlobalVariable(name) : false;
    },

    GlobalVariableCheck: (name: string) => {
      const term = context.terminal;
      return term ? term.checkGlobalVariable(name) : false;
    },

    GlobalVariableTime: (name: string) => {
      const term = context.terminal;
      return term ? term.getGlobalVariableTime(name) : 0;
    },

    GlobalVariablesDeleteAll: (prefix = "") => {
      const term = context.terminal;
      return term ? term.deleteAllGlobalVariables(prefix) : 0;
    },

    GlobalVariablesTotal: () => {
      const term = context.terminal;
      return term ? term.globalVariablesTotal() : 0;
    },

    GlobalVariableName: (index: number) => {
      const term = context.terminal;
      return term ? term.getGlobalVariableName(index) : "";
    },

    GlobalVariableTemp: (name: string, value: number) => {
      const term = context.terminal;
      return term ? term.setGlobalVariable(name, value) : value;
    },

    GlobalVariableSetOnCondition: (name: string, value: number, check: number) => {
      const term = context.terminal;
      return term ? term.setGlobalVariableOnCondition(name, value, check) : false;
    },

    GlobalVariablesFlush: () => {
      const term = context.terminal;
      return term ? term.flushGlobalVariables() : 0;
    },
  };
}
