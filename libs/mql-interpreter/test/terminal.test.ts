import { describe, it, expect } from "vitest";
import { VirtualTerminal } from "../src/core/runtime/terminal";
import { unlinkSync } from "fs";

describe("VirtualTerminal", () => {
  it("can write and read files in memory", () => {
    const term = new VirtualTerminal();
    const handle = term.open("test.txt", "w");
    term.write(handle, "hello");
    term.close(handle);
    const h2 = term.open("test.txt", "r");
    const data = term.read(h2);
    expect(data).toBe("hello");
  });

  it("manages global variables", () => {
    const path = "globals.json";
    try {
      unlinkSync(path);
    } catch (_err) {
      void _err;
      // ignore missing file
    }
    const term = new VirtualTerminal(path);
    term.setGlobalVariable("x", 5);
    expect(term.getGlobalVariable("x")).toBe(5);
    expect(term.checkGlobalVariable("x")).toBe(true);
    expect(term.globalVariablesTotal()).toBe(1);
    const t = term.getGlobalVariableTime("x");
    expect(t).toBeGreaterThan(0);
    expect(term.setGlobalVariableOnCondition("x", 6, 5)).toBe(true);
    expect(term.getGlobalVariable("x")).toBe(6);
    expect(term.setGlobalVariableOnCondition("x", 7, 5)).toBe(false);
    expect(term.deleteGlobalVariable("x")).toBe(true);
    expect(term.globalVariablesTotal()).toBe(0);

    term.setGlobalVariable("y", 2);
    term.flushGlobalVariables();
    const term2 = new VirtualTerminal(path);
    expect(term2.getGlobalVariable("y")).toBe(2);
    unlinkSync(path);
  });
});
