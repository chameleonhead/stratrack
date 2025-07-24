import type { BuiltinFunction } from '../types';
import * as AccountInfo from './AccountInfo';
import { OrderSend } from './OrderSend';
import { iMA } from './iMA';
import { ArrayResize } from './ArrayResize';
import { ArrayCopy } from './ArrayCopy';
import { ArraySetAsSeries } from './ArraySetAsSeries';
import { StringTrimLeft } from './StringTrimLeft';
import { StringTrimRight } from './StringTrimRight';
import { StringLen } from './StringLen';
import { StringSubstr } from './StringSubstr';
import { Print } from './Print';
import { Alert } from './Alert';
import { PrintFormat } from './PrintFormat';
import { Comment } from './Comment';
import { GetTickCount } from './GetTickCount';
import { Sleep } from './Sleep';
import { CharToString } from './CharToString';
import { StringToTime } from './StringToTime';
import { NormalizeDouble } from './NormalizeDouble';
import { MathAbs } from './MathAbs';
import { MathPow } from './MathPow';
import { MathSqrt } from './MathSqrt';
import { Day } from './Day';
import { Hour } from './Hour';
import { TimeCurrent } from './TimeCurrent';
import { TimeToStruct } from './TimeToStruct';

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
