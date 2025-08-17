import type { BuiltinFunction } from "./types";

interface IndicatorState {
  buffers: unknown[];
  props: Record<number | string, unknown>;
  labels: string[];
  shifts: number[];
  shortName: string;
}

const state: IndicatorState = {
  buffers: [],
  props: {},
  labels: [],
  shifts: [],
  shortName: "",
};

export const IndicatorBuffers: BuiltinFunction = (count: number) => {
  state.buffers = Array<unknown>(count).fill(null);
  state.labels = Array<string>(count).fill("");
  state.shifts = Array<number>(count).fill(0);
  return 0;
};

export const SetIndexBuffer: BuiltinFunction = (index: number, arr: number[]) => {
  if (index < 0) return false;
  state.buffers[index] = arr;
  return true;
};

export const SetIndexLabel: BuiltinFunction = (index: number, text: string) => {
  if (index < 0) return false;
  state.labels[index] = text;
  return true;
};

export const SetIndexShift: BuiltinFunction = (index: number, shift: number) => {
  if (index < 0) return false;
  state.shifts[index] = shift;
  return true;
};

export const IndicatorCounted: BuiltinFunction = () => 0;

export const IndicatorDigits: BuiltinFunction = () => 0;

export const IndicatorSetDouble: BuiltinFunction = (prop: number, value: number) => {
  state.props[prop] = value;
  return 0;
};

export const IndicatorSetInteger: BuiltinFunction = (prop: number, value: number) => {
  state.props[prop] = value;
  return 0;
};

export const IndicatorSetString: BuiltinFunction = (prop: number, value: string) => {
  state.props[prop] = value;
  return 0;
};

export const IndicatorShortName: BuiltinFunction = (name: string) => {
  state.shortName = name;
  return 0;
};
