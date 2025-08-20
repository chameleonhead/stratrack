import type { BuiltinFunction } from "./types";
import { getContext } from "./context";

export const FileOpen: BuiltinFunction = (name: string, mode: string) => {
  const term = getContext().terminal;
  if (!term) return -1;
  return term.open(name, mode);
};

export const FileReadString: BuiltinFunction = (handle: number) => {
  const term = getContext().terminal;
  return term?.read(handle) ?? "";
};

export const FileWriteString: BuiltinFunction = (handle: number, text: string) => {
  const term = getContext().terminal;
  term?.write(handle, text);
  return text.length;
};

export const FileClose: BuiltinFunction = (handle: number) => {
  getContext().terminal?.close(handle);
  return 0;
};
