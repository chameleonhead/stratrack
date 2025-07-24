import type { BuiltinFunction } from '../types';
import { format } from 'util';

export const Print: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return 0;
};

export const Alert: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return true;
};

export const Comment: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return 0;
};

export const PrintFormat: BuiltinFunction = (fmt: string, ...args: any[]) => {
  console.log(format(fmt, ...args));
  return 0;
};

export const GetTickCount: BuiltinFunction = () => Date.now();

export const Sleep: BuiltinFunction = (ms: number) => {
  const arr = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(arr, 0, 0, ms);
  return 0;
};

export const PlaySound: BuiltinFunction = (_file: string) => true;
export const SendMail: BuiltinFunction = (_to: string, _subj: string, _body: string) => true;
export const SendNotification: BuiltinFunction = (_msg: string) => true;
export const SendFTP: BuiltinFunction = (_file: string, _ftp: string) => true;
export const TerminalClose: BuiltinFunction = () => true;
export const ExpertRemove: BuiltinFunction = () => true;
export const DebugBreak: BuiltinFunction = () => 0;
export const MessageBox: BuiltinFunction = (_text: string, _caption?: string, _flags?: number) => 1;
export const GetTickCount64: BuiltinFunction = () => BigInt(Date.now());
export const GetMicrosecondCount: BuiltinFunction = () => {
  const [sec, nano] = process.hrtime();
  return sec * 1_000_000 + Math.floor(nano / 1_000);
};

export const WebRequest: BuiltinFunction = (
  _method: string,
  _url: string,
  _headers: string[] = [],
  _data: string = '',
  _timeout: number = 5000,
  result?: { value: string },
) => {
  if (result) result.value = '';
  return -1;
};
