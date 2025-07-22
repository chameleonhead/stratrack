import type { BuiltinFunction } from '../types';
import * as AccountInfo from './AccountInfo';
import { OrderSend } from './OrderSend';
import { iMA } from './iMA';
import { ArrayResize } from './ArrayResize';
import { StringTrimLeft } from './StringTrimLeft';
import { Print } from './Print';
import { Alert } from './Alert';

export const coreBuiltins: Record<string, BuiltinFunction> = {
  Print,
  Alert,
  ArrayResize,
  StringTrimLeft,
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
  StringTrimLeft,
  AccountInfo,
};
