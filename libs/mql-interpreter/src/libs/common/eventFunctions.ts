import type { BuiltinFunction } from "./types";
import { getTerminal } from "./terminal";

export const EventSetTimer: BuiltinFunction = (seconds: number) => {
  const term = getTerminal();
  term?.setTimer(Number(seconds));
  return 0;
};

export const EventSetMillisecondTimer: BuiltinFunction = (ms: number) => {
  const term = getTerminal();
  term?.setTimer(Number(ms) / 1000);
  return 0;
};

export const EventKillTimer: BuiltinFunction = () => {
  const term = getTerminal();
  term?.killTimer();
  return 0;
};

export const EventChartCustom: BuiltinFunction = (
  id: number,
  lparam: number,
  dparam: number,
  sparam: string
) => {
  const term = getTerminal();
  term?.queueChartEvent(id, lparam, dparam, sparam);
  return true;
};
