import { describe, it, expect, beforeEach } from "vitest";
import { VirtualTerminal } from "../../../src/libs/virtualTerminal";
import { setTerminal } from "../../../src/libs/builtins/common";
import {
  FileOpen,
  FileReadString,
  FileWriteString,
  FileClose,
} from "../../../src/libs/builtins/file";

describe("file builtins", () => {
  beforeEach(() => {
    const term = new VirtualTerminal();
    setTerminal(term);
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
