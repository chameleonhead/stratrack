// Import paths omit extensions for bundler compatibility.
import type { BuiltinFunction } from "./types";
import { formatString } from "./format";
import { DateTimeValue } from "../../runtime/datetimeValue";
import { getTerminal } from "./terminal";

export const Print: BuiltinFunction = (...args: any[]) => {
  const formatted = args.map((a) => (a instanceof DateTimeValue ? a.toString() : a));
  const term = getTerminal();
  if (term) return term.print(...formatted);
  console.log(...formatted);
  return 0;
};

export const Alert: BuiltinFunction = (...args: any[]) => {
  const term = getTerminal();
  if (term) return term.alert(...args);
  console.log(...args);
  return true;
};

export const Comment: BuiltinFunction = (...args: any[]) => {
  const term = getTerminal();
  if (term) return term.comment(...args);
  console.log(...args);
  return 0;
};

export const PrintFormat: BuiltinFunction = (fmt: string, ...args: any[]) => {
  const text = formatString(fmt, ...args);
  const term = getTerminal();
  if (term) return term.print(text);
  console.log(text);
  return 0;
};

export const GetTickCount: BuiltinFunction = () => Date.now();

export const Sleep: BuiltinFunction = (ms: number) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* busy wait */
  }
  return 0;
};

export const PlaySound: BuiltinFunction = (file: string) => {
  const term = getTerminal();
  return term ? term.playSound(file) : true;
};
export const SendMail: BuiltinFunction = (_to: string, _subj: string, _body: string) => true;
export const SendNotification: BuiltinFunction = (_msg: string) => true;
export const SendFTP: BuiltinFunction = (_file: string, _ftp: string) => true;
export const TerminalClose: BuiltinFunction = () => true;
export const ExpertRemove: BuiltinFunction = () => true;
export const DebugBreak: BuiltinFunction = () => 0;
export const MessageBox: BuiltinFunction = (_text: string, _caption?: string, _flags?: number) => 1;
export const GetTickCount64: BuiltinFunction = () => BigInt(Date.now());
export const GetMicrosecondCount: BuiltinFunction = () => {
  const t = typeof performance !== "undefined" ? performance.now() : Date.now();
  return Math.floor(t * 1000);
};

export const WebRequest: BuiltinFunction = (
  _method: string,
  _url: string,
  _headers: string[] = [],
  _data: string = "",
  _timeout: number = 5000,
  result?: { value: string }
) => {
  if (result) result.value = "";
  return -1;
};

export const TerminalCompany: BuiltinFunction = () => "MetaQuotes Software Corp.";
export const TerminalName: BuiltinFunction = () => "MetaTrader";
export const TerminalPath: BuiltinFunction = () => "";
export const IsTesting: BuiltinFunction = () => false;
export const IsOptimization: BuiltinFunction = () => false;
export const IsVisualMode: BuiltinFunction = () => false;
export const IsDemo: BuiltinFunction = () => false;
export const IsConnected: BuiltinFunction = () => true;
export const IsTradeAllowed: BuiltinFunction = () => true;
export const IsTradeContextBusy: BuiltinFunction = () => false;
export const UninitializeReason: BuiltinFunction = () => 0;
