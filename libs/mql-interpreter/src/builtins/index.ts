export type BuiltinFunction = (...args: any[]) => any;

const noop: BuiltinFunction = () => 0;

const builtins: Record<string, BuiltinFunction> = {
  Print: (...args: any[]) => {
    console.log(...args);
    return 0;
  },
  Alert: (...args: any[]) => {
    console.log(...args);
    return true;
  },
  OrderSend: (..._args: any[]) => 0,
  iMA: (..._args: any[]) => 0,
  // Account information functions (stubs)
  AccountBalance: noop,
  AccountCompany: () => '',
  AccountCredit: noop,
  AccountCurrency: () => '',
  AccountEquity: noop,
  AccountFreeMargin: noop,
  AccountFreeMarginCheck: noop,
  AccountFreeMarginMode: noop,
  AccountInfoDouble: noop,
  AccountInfoInteger: noop,
  AccountInfoString: () => '',
  AccountLeverage: noop,
  AccountMargin: noop,
  AccountName: () => '',
  AccountNumber: noop,
  AccountProfit: noop,
  AccountServer: () => '',
  AccountStopoutLevel: noop,
  AccountStopoutMode: noop,
  ArrayResize: (arr: any[], newSize: number) => {
    ArrayResizeHelper(arr, newSize);
    return arr.length;
  },
  StringTrimLeft: (str: { value: string }) => {
    str.value = str.value.replace(/^\s+/, '');
    return str.value.length;
  },
};

import { builtinNames } from './stubNames';
import { ArrayResize as ArrayResizeHelper } from '../arrayResize';
for (const name of builtinNames) {
  if (!builtins[name]) builtins[name] = noop;
}

export function getBuiltin(name: string): BuiltinFunction | undefined {
  return builtins[name];
}

