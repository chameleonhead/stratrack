// Import paths use explicit `.js` extensions to satisfy NodeNext module resolution.
import type { BuiltinFunction } from "../types.js";
import { formatString } from "./format.js";
import type { VirtualTerminal } from "../../terminal.js";
import { DateTimeValue } from "../../datetimeValue.js";

let terminal: VirtualTerminal | null = null;
export function setTerminal(t: VirtualTerminal | null): void {
  terminal = t;
}

export function getTerminal(): VirtualTerminal | null {
  return terminal;
}

export const Print: BuiltinFunction = (...args: any[]) => {
  const formatted = args.map((a) => (a instanceof DateTimeValue ? a.toString() : a));
  if (terminal) return terminal.print(...formatted);
  console.log(...formatted);
  return 0;
};

export const Alert: BuiltinFunction = (...args: any[]) => {
  if (terminal) return terminal.alert(...args);
  console.log(...args);
  return true;
};

export const Comment: BuiltinFunction = (...args: any[]) => {
  if (terminal) return terminal.comment(...args);
  console.log(...args);
  return 0;
};

export const PrintFormat: BuiltinFunction = (fmt: string, ...args: any[]) => {
  const text = formatString(fmt, ...args);
  if (terminal) return terminal.print(text);
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

export const EventSetTimer: BuiltinFunction = (seconds: number) => {
  if (terminal) terminal.setTimer(Number(seconds));
  return 0;
};

export const EventSetMillisecondTimer: BuiltinFunction = (ms: number) => {
  if (terminal) terminal.setTimer(Number(ms) / 1000);
  return 0;
};

export const EventKillTimer: BuiltinFunction = () => {
  if (terminal) terminal.killTimer();
  return 0;
};

export const PlaySound: BuiltinFunction = (file: string) => {
  return terminal ? terminal.playSound(file) : true;
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

const globalVars: Record<string, { value: number; time: number }> = {};

export const GlobalVariableSet: BuiltinFunction = (name: string, value: number) => {
  if (terminal) return terminal.setGlobalVariable(name, value);
  globalVars[name] = { value, time: Math.floor(Date.now() / 1000) };
  return value;
};

export const GlobalVariableGet: BuiltinFunction = (name: string) => {
  if (terminal) return terminal.getGlobalVariable(name);
  return globalVars[name]?.value ?? 0;
};

export const GlobalVariableDel: BuiltinFunction = (name: string) => {
  if (terminal) return terminal.deleteGlobalVariable(name);
  const existed = name in globalVars;
  delete globalVars[name];
  return existed;
};

export const GlobalVariableCheck: BuiltinFunction = (name: string) => {
  if (terminal) return terminal.checkGlobalVariable(name);
  return name in globalVars;
};

export const GlobalVariableTime: BuiltinFunction = (name: string) => {
  if (terminal) return terminal.getGlobalVariableTime(name);
  return globalVars[name]?.time ?? 0;
};

export const GlobalVariablesDeleteAll: BuiltinFunction = (prefix = "") => {
  if (terminal) return terminal.deleteAllGlobalVariables(prefix);
  let count = 0;
  for (const k of Object.keys(globalVars)) {
    if (!prefix || k.startsWith(prefix)) {
      delete globalVars[k];
      count++;
    }
  }
  return count;
};

export const GlobalVariablesTotal: BuiltinFunction = () => {
  if (terminal) return terminal.globalVariablesTotal();
  return Object.keys(globalVars).length;
};

export const GlobalVariableName: BuiltinFunction = (index: number) => {
  if (terminal) return terminal.getGlobalVariableName(index);
  const names = Object.keys(globalVars);
  return names[index] ?? "";
};

export const GlobalVariableTemp: BuiltinFunction = (name: string, value: number) =>
  GlobalVariableSet(name, value);

export const GlobalVariableSetOnCondition: BuiltinFunction = (
  name: string,
  value: number,
  check: number
) => {
  if (terminal) return terminal.setGlobalVariableOnCondition(name, value, check);
  if (!globalVars[name] || globalVars[name].value === check) {
    globalVars[name] = { value, time: Math.floor(Date.now() / 1000) };
    return true;
  }
  return false;
};

export const GlobalVariablesFlush: BuiltinFunction = () => {
  if (terminal) return terminal.flushGlobalVariables();
  return 0;
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
