import { describe, it, expect, beforeEach } from "vitest";
import { VirtualTerminal } from "../../../src/libs/virtualTerminal";
import { createFiles } from "../../../src/libs/functions/files";
import type { ExecutionContext } from "../../../src/libs/functions/types";

describe("file builtins", () => {
  let fileFuncs: ReturnType<typeof createFiles>;
  
  beforeEach(() => {
    const term = new VirtualTerminal();
    const context: ExecutionContext = { 
      terminal: term, 
      broker: null, 
      account: null, 
      market: null, 
      symbol: "TEST", 
      timeframe: 60, 
      indicators: null 
    };
    fileFuncs = createFiles(context);
  });

  it("writes and reads strings", () => {
    const h = fileFuncs.FileOpen("test.txt", "w");
    expect(h).toBeGreaterThan(0);
    fileFuncs.FileWriteString(h, "hello");
    fileFuncs.FileClose(h);
    const h2 = fileFuncs.FileOpen("test.txt", "r");
    const txt = fileFuncs.FileReadString(h2);
    expect(txt).toBe("hello");
    fileFuncs.FileClose(h2);
  });
});
