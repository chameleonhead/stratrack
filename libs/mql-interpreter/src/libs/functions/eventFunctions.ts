import type { BuiltinFunction } from "./types";
import { getContext } from "./context";

export const EventSetTimer: BuiltinFunction = (seconds: number) => {
  const term = getContext().terminal;
  term?.setTimer(Number(seconds));
  return 0;
};

export const EventSetMillisecondTimer: BuiltinFunction = (ms: number) => {
  const term = getContext().terminal;
  term?.setTimer(Number(ms) / 1000);
  return 0;
};

export const EventKillTimer: BuiltinFunction = () => {
  const term = getContext().terminal;
  term?.killTimer();
  return 0;
};

export const EventChartCustom: BuiltinFunction = (
  id: number,
  lparam: number,
  dparam: number,
  sparam: string
) => {
  const term = getContext().terminal;
  term?.queueChartEvent(id, lparam, dparam, sparam);
  return true;
};
