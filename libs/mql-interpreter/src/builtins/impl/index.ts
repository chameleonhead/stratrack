import type { BuiltinFunction } from '../types';
import * as AccountInfo from './AccountInfo';
import { OrderSend } from './OrderSend';
import { iMA } from './iMA';
import { ArrayResize, ArrayCopy, ArraySetAsSeries } from './array';
import { CharToString, StringToTime, NormalizeDouble } from './convert';
import { MathAbs, MathPow, MathSqrt } from './math';
import { StringTrimLeft, StringTrimRight, StringLen, StringSubstr } from './strings';
import { Day, Hour, TimeCurrent, TimeToStruct } from './datetime';
import { Print, Alert, PrintFormat, Comment, GetTickCount, Sleep, WebRequest } from './common';

export const coreBuiltins: Record<string, BuiltinFunction> = {
  Print,
  Alert,
  ArrayResize,
  ArrayCopy,
  ArraySetAsSeries,
  StringTrimLeft,
  StringTrimRight,
  StringLen,
  StringSubstr,
  PrintFormat,
  Comment,
  GetTickCount,
  Sleep,
  WebRequest,
  CharToString,
  StringToTime,
  NormalizeDouble,
  MathAbs,
  MathPow,
  MathSqrt,
  Day,
  Hour,
  TimeCurrent,
  TimeToStruct,
};

export const envBuiltins: Record<string, BuiltinFunction> = {
  ...AccountInfo,
  OrderSend,
  iMA,
};

export {
  Print,
  Alert,
  OrderSend,
  iMA,
  ArrayResize,
  ArrayCopy,
  ArraySetAsSeries,
  StringTrimLeft,
  StringTrimRight,
  StringLen,
  StringSubstr,
  PrintFormat,
  Comment,
  GetTickCount,
  Sleep,
  WebRequest,
  CharToString,
  StringToTime,
  NormalizeDouble,
  MathAbs,
  MathPow,
  MathSqrt,
  Day,
  Hour,
  TimeCurrent,
  TimeToStruct,
  AccountInfo,
};
