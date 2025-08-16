import type { BuiltinFunction } from "./types";
import { formatString } from "./format";

export const CharToString: BuiltinFunction = (ch: number | string) => {
  if (typeof ch === "number") return String.fromCharCode(ch);
  return ch.charAt(0);
};

export const StringToTime: BuiltinFunction = (s: string) => {
  const t = Date.parse(s);
  return isNaN(t) ? 0 : Math.floor(t / 1000);
};

export const NormalizeDouble: BuiltinFunction = (value: number, digits: number) => {
  return parseFloat(value.toFixed(digits));
};

export const DoubleToString: BuiltinFunction = (value: number, digits = 0) => {
  return digits >= 0 ? value.toFixed(digits) : value.toString();
};

export const IntegerToString: BuiltinFunction = (value: number, radix = 10) => {
  return Math.trunc(value).toString(radix);
};

export const StringToDouble: BuiltinFunction = (s: string) => {
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
};

export const StringToInteger: BuiltinFunction = (s: string, base = 10) => {
  const v = parseInt(s, base);
  return isNaN(v) ? 0 : v;
};

export const StringFormat: BuiltinFunction = (fmt: string, ...args: any[]) => {
  return formatString(fmt, ...args);
};

export const StringToCharArray: BuiltinFunction = (
  s: string,
  buffer: number[] = [],
  start = 0,
  count = s.length
) => {
  for (let i = 0; i < count && i < s.length; i++) {
    buffer[start + i] = s.charCodeAt(i);
  }
  return buffer;
};

export const CharArrayToString: BuiltinFunction = (
  arr: number[],
  start = 0,
  count = arr.length - start
) => {
  return String.fromCharCode(...arr.slice(start, start + count));
};

export const TimeToString: BuiltinFunction = (t: number) => {
  return new Date(t * 1000).toISOString();
};

// aliases
export const DoubleToStr = DoubleToString;
export const CharToStr = CharToString;
export const StrToDouble = StringToDouble;
export const StrToInteger = StringToInteger;
export const TimeToStr = TimeToString;
