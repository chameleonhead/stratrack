import { describe, it, expect, beforeEach } from "vitest";
import { VirtualTerminal } from "../../../src/libs/virtualTerminal";
import { setContext } from "../../../src/libs/functions/context";
import {
  FileOpen,
  FileReadString,
  FileWriteString,
  FileClose,
} from "../../../src/libs/functions/files";

describe("file builtins", () => {
  beforeEach(() => {
    const term = new VirtualTerminal();
    setContext({ terminal: term, broker: null, account: null, market: null });
  });

  it("writes and reads strings", () => {
    const h = FileOpen("test.txt", "w");
    expect(h).toBeGreaterThan(0);
    FileWriteString(h, "hello");
    FileClose(h);
    const h2 = FileOpen("test.txt", "r");
    const txt = FileReadString(h2);
    expect(txt).toBe("hello");
    FileClose(h2);
  });
});
