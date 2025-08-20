import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/common
export const commonBuiltinSignatures: BuiltinSignaturesMap = {
  Alert: {
    args: [],
    returnType: "void",
    description: "Displays a message in a separate window",
  },
  CheckPointer: {
    args: [],
    returnType: "int",
    description: "Returns the type of the object pointer",
  },
  Comment: {
    args: [],
    returnType: "void",
    description: "Outputs a comment in the left top corner of the chart",
  },
  CryptDecode: {
    args: [],
    returnType: "void",
    description: "Performs the inverse transformation of the data from array",
  },
  CryptEncode: {
    args: [],
    returnType: "void",
    description: "Transforms the data from array with the specified method",
  },
  DebugBreak: {
    args: [],
    returnType: "void",
    description: "Program breakpoint in debugging",
  },
  ExpertRemove: {
    args: [],
    returnType: "void",
    description: "Stops Expert Advisor and unloads it from the chart",
  },
  GetPointer: {
    args: [],
    returnType: "int",
    description: "Returns the object pointer",
  },
  GetTickCount: {
    args: [],
    returnType: "long",
    description:
      "Returns the number of milliseconds that have elapsed since the system was started",
  },
  GetTickCount64: {
    args: [],
    returnType: "long",
    description:
      "Returns the number of milliseconds that have elapsed since the system was started (64-bit)",
  },
  GetMicrosecondCount: {
    args: [],
    returnType: "long",
    description: "Returns the number of microseconds that have elapsed since the terminal start",
  },
  MessageBox: {
    args: [],
    returnType: "int",
    description: "Creates, displays a message box and manages it",
  },
  PeriodSeconds: {
    args: [],
    returnType: "int",
    description: "Returns the number of seconds in the period",
  },
  PlaySound: {
    args: [{ name: "filename", type: "string", optional: false }],
    returnType: "bool",
    description: "Plays a sound file",
  },
  Print: {
    args: [{ name: "args", type: "any", variadic: true }],
    returnType: "void",
    description: "Displays a message in the log",
  },
  PrintFormat: {
    args: [
      { name: "format", type: "string" },
      { name: "args", type: "any", variadic: true },
    ],
    returnType: "void",
    description:
      "Formats and prints the sets of symbols and values in a log file in accordance with a preset format",
  },
  ResetLastError: {
    args: [],
    returnType: "void",
    description: "Sets the value of a predetermined variable _LastError to zero",
  },
  ResourceCreate: {
    args: [],
    returnType: "int",
    description: "Creates an image resource based on a data set",
  },
  ResourceFree: {
    args: [],
    returnType: "void",
    description: "Deletes dynamically created resource (freeing the memory allocated for it)",
  },
  ResourceReadImage: {
    args: [],
    returnType: "void",
    description:
      "Reads data from the graphical resource created by ResourceCreate() function or saved in EX4 file during compilation",
  },
  ResourceSave: {
    args: [],
    returnType: "void",
    description: "Saves a resource into the specified file",
  },
  SendFTP: {
    args: [],
    returnType: "void",
    description: "Sends a file at the address specified in the settings window of the 'FTP' tab",
  },
  SendMail: {
    args: [],
    returnType: "void",
    description:
      "Sends an email at the address specified in the settings window of the 'Email' tab",
  },
  SendNotification: {
    args: [],
    returnType: "void",
    description:
      "Sends push notifications to mobile terminals, whose MetaQuotes ID are specified in the 'Notifications' tab",
  },
  Sleep: {
    args: [{ name: "duration", type: "int", optional: false }],
    returnType: "void",
    description:
      "Suspends execution of the current Expert Advisor or script within a specified interval",
  },
  TerminalClose: {
    args: [],
    returnType: "void",
    description: "Commands the terminal to complete operation",
  },
  TesterStatistics: {
    args: [],
    returnType: "void",
    description:
      "It returns the value of a specified statistic calculated based on testing results",
  },
  WebRequest: {
    args: [],
    returnType: "void",
    description: "Sends HTTP request to the specified server",
  },
  ZeroMemory: {
    args: [{ name: "variable", type: "any", optional: false }],
    returnType: "void",
    description:
      "Resets a variable passed to it by reference. The variable can be of any type, except for classes and structures that have constructors.",
  },
};
