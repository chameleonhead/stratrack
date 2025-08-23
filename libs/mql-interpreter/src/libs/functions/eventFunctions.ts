import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createEventFunctions(context: ExecutionContext): Record<string, BuiltinFunction> {
  return {
    EventSetTimer: (seconds: number) => {
      const term = context.terminal;
      term?.setTimer(Number(seconds));
      return 0;
    },

    EventSetMillisecondTimer: (ms: number) => {
      const term = context.terminal;
      term?.setTimer(Number(ms) / 1000);
      return 0;
    },

    EventKillTimer: () => {
      const term = context.terminal;
      term?.killTimer();
      return 0;
    },

    EventChartCustom: (id: number, lparam: number, dparam: number, sparam: string) => {
      const term = context.terminal;
      term?.queueChartEvent(id, lparam, dparam, sparam);
      return true;
    },
  };
}
