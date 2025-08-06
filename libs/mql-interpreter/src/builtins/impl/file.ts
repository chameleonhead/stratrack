import type { BuiltinFunction } from "../types.js";
import { getTerminal } from "./common.js";

export const FileOpen: BuiltinFunction = (name: string, mode: string) => {
  const term = getTerminal();
  if (!term) return -1;
  return term.open(name, mode);
};

export const FileReadString: BuiltinFunction = (handle: number) => {
  const term = getTerminal();
  return term?.read(handle) ?? "";
};

export const FileWriteString: BuiltinFunction = (handle: number, text: string) => {
  const term = getTerminal();
  term?.write(handle, text);
  return text.length;
};

export const FileClose: BuiltinFunction = (handle: number) => {
  getTerminal()?.close(handle);
  return 0;
};
