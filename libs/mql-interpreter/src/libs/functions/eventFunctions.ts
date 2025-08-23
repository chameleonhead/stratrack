import type { BuiltinFunction, ExecutionContext } from "./types";

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

// Legacy exports for registry.ts compatibility - these should not be used directly
const createDummyContext = () => ({ terminal: null, broker: null, account: null, market: null, symbol: "", timeframe: 0, indicators: null });
const eventFuncs = createEventFunctions(createDummyContext() as any);

export const EventSetTimer = eventFuncs.EventSetTimer;
export const EventSetMillisecondTimer = eventFuncs.EventSetMillisecondTimer;
export const EventKillTimer = eventFuncs.EventKillTimer;
export const EventChartCustom = eventFuncs.EventChartCustom;
