import type { BuiltinFunction } from "../types.js";

let buffers: any[] = [];
const counted = 0;
const digits = 0;
const props: Record<number | string, any> = {};
let _shortName = "";

export const IndicatorBuffers: BuiltinFunction = (count: number) => {
  buffers = Array(count).fill(null);
  return 0;
};

export const SetIndexBuffer: BuiltinFunction = (index: number, arr: any[]) => {
  if (index < 0) return false;
  buffers[index] = arr;
  return true;
};

export const IndicatorCounted: BuiltinFunction = () => counted;

export const IndicatorDigits: BuiltinFunction = () => digits;

export const IndicatorSetDouble: BuiltinFunction = (prop: number, value: number) => {
  props[prop] = value;
  return 0;
};

export const IndicatorSetInteger: BuiltinFunction = (prop: number, value: number) => {
  props[prop] = value;
  return 0;
};

export const IndicatorSetString: BuiltinFunction = (prop: number, value: string) => {
  props[prop] = value;
  return 0;
};

export const IndicatorShortName: BuiltinFunction = (name: string) => {
  _shortName = name;
  return 0;
};
