import type { BuiltinFunction, ExecutionContext } from "./types";

export function createFiles(context: ExecutionContext): Record<string, BuiltinFunction> {
  return {
    FileOpen: (name: string, mode: string) => {
      const term = context.terminal;
      if (!term) return -1;
      return term.open(name, mode);
    },
    FileReadString: (handle: number) => {
      const term = context.terminal;
      return term?.read(handle) ?? "";
    },
    FileWriteString: (handle: number, text: string) => {
      const term = context.terminal;
      term?.write(handle, text);
      return text.length;
    },
    FileClose: (handle: number) => {
      context.terminal?.close(handle);
      return 0;
    }
  }
}


