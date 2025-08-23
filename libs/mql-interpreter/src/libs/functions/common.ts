// Import paths omit extensions for bundler compatibility.
import type { BuiltinFunction, ExecutionContext } from "./types";
import { formatString } from "./format";
import { DateTimeValue } from "../../runtime/datetimeValue";

export function createCommon(context: ExecutionContext): Record<string, BuiltinFunction> {
  return {
    Print: (...args: any[]) => {
      const formatted = args.map((a) => (a instanceof DateTimeValue ? a.toString() : a));
      const term = context.terminal;
      if (term) return term.print(...formatted);
      console.log(...formatted);
      return 0;
    },

    Alert: (...args: any[]) => {
      const term = context.terminal;
      if (term) return term.alert(...args);
      console.log(...args);
      return true;
    },

    Comment: (...args: any[]) => {
      const term = context.terminal;
      if (term) return term.comment(...args);
      console.log(...args);
      return 0;
    },

    PrintFormat: (fmt: string, ...args: any[]) => {
      const text = formatString(fmt, ...args);
      const term = context.terminal;
      if (term) return term.print(text);
      console.log(text);
      return 0;
    },

    // alias for MQL printf
    printf: (fmt: string, ...args: any[]) => {
      const text = formatString(fmt, ...args);
      const term = context.terminal;
      if (term) return term.print(text);
      console.log(text);
      return 0;
    },

    GetTickCount: () => Date.now(),

    Sleep: (ms: number) => {
      const end = Date.now() + ms;
      while (Date.now() < end) {
        /* busy wait */
      }
      return 0;
    },

    PlaySound: (file: string) => {
      const term = context.terminal;
      return term ? term.playSound(file) : true;
    },

    SendMail: (_to: string, _subj: string, _body: string) => true,
    SendNotification: (_msg: string) => true,
    SendFTP: (_file: string, _ftp: string) => true,
    TerminalClose: () => true,
    ExpertRemove: () => true,
    DebugBreak: () => 0,
    MessageBox: (_text: string, _caption?: string, _flags?: number) => 1,
    GetTickCount64: () => BigInt(Date.now()),
    GetMicrosecondCount: () => {
      const t = typeof performance !== "undefined" ? performance.now() : Date.now();
      return Math.floor(t * 1000);
    },

    WebRequest: (
      _method: string,
      _url: string,
      _headers: string[] = [],
      _data: string = "",
      _timeout: number = 5000,
      result?: { value: string }
    ) => {
      if (result) result.value = "";
      return -1;
    },

    TerminalCompany: () => "MetaQuotes Software Corp.",
    TerminalName: () => "MetaTrader",
    TerminalPath: () => "",
    IsTesting: () => false,
    IsOptimization: () => false,
    IsVisualMode: () => false,
    IsDemo: () => false,
    IsConnected: () => true,
    IsTradeAllowed: () => true,
    IsTradeContextBusy: () => false,
    UninitializeReason: () => 0,
  };
}

// Legacy exports for registry.ts compatibility - these should not be used directly
const createDummyContext = () => ({ terminal: null, broker: null, account: null, market: null, symbol: "", timeframe: 0, indicators: null });
const commonFuncs = createCommon(createDummyContext() as any);

export const Print = commonFuncs.Print;
export const Alert = commonFuncs.Alert;
export const Comment = commonFuncs.Comment;
export const PrintFormat = commonFuncs.PrintFormat;
export const printf = commonFuncs.printf;
export const GetTickCount = commonFuncs.GetTickCount;
export const GetTickCount64 = commonFuncs.GetTickCount64;
export const GetMicrosecondCount = commonFuncs.GetMicrosecondCount;
export const Sleep = commonFuncs.Sleep;
export const PlaySound = commonFuncs.PlaySound;
export const SendMail = commonFuncs.SendMail;
export const SendNotification = commonFuncs.SendNotification;
export const SendFTP = commonFuncs.SendFTP;
export const TerminalClose = commonFuncs.TerminalClose;
export const ExpertRemove = commonFuncs.ExpertRemove;
export const DebugBreak = commonFuncs.DebugBreak;
export const MessageBox = commonFuncs.MessageBox;
export const WebRequest = commonFuncs.WebRequest;
export const TerminalCompany = commonFuncs.TerminalCompany;
export const TerminalName = commonFuncs.TerminalName;
export const TerminalPath = commonFuncs.TerminalPath;
export const IsTesting = commonFuncs.IsTesting;
export const IsOptimization = commonFuncs.IsOptimization;
export const IsVisualMode = commonFuncs.IsVisualMode;
export const IsDemo = commonFuncs.IsDemo;
export const IsConnected = commonFuncs.IsConnected;
export const IsTradeAllowed = commonFuncs.IsTradeAllowed;
export const IsTradeContextBusy = commonFuncs.IsTradeContextBusy;
export const UninitializeReason = commonFuncs.UninitializeReason;
