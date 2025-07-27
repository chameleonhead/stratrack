import {
  Print,
  Alert,
  Comment,
  PrintFormat,
  GetTickCount,
  GetTickCount64,
  GetMicrosecondCount,
  Sleep,
  PlaySound,
  SendMail,
  SendNotification,
  SendFTP,
  TerminalClose,
  ExpertRemove,
  DebugBreak,
  MessageBox,
  GlobalVariableSet,
  GlobalVariableGet,
  GlobalVariableDel,
  GlobalVariableCheck,
  GlobalVariablesDeleteAll,
  GlobalVariablesTotal,
  GlobalVariableName,
  GlobalVariableTime,
  GlobalVariableSetOnCondition,
  setTerminal,
} from "../../src/builtins/impl/common";
import { builtinSignatures } from "../../src/builtins/signatures";
import { coreBuiltins, envBuiltins } from "../../src/builtins/impl";
import { VirtualTerminal } from "../../src/terminal";
import { describe, it, expect, beforeEach } from "vitest";

describe("common builtins", () => {
  beforeEach(() => {
    const term = new VirtualTerminal();
    setTerminal(term);
  });
  it("Print and Comment output and return 0", () => {
    expect(Print("a")).toBe(0);
    expect(Comment("b")).toBe(0);
  });

  it("Alert returns true", () => {
    expect(Alert("x")).toBe(true);
  });

  it("PrintFormat formats strings", () => {
    expect(PrintFormat("num %d", 5)).toBe(0);
  });

  it("GetTickCount returns increasing time", async () => {
    const a = GetTickCount();
    await new Promise((r) => setTimeout(r, 10));
    const b = GetTickCount();
    expect(b >= a).toBe(true);
  });

  it("Sleep waits at least specified time", () => {
    const start = Date.now();
    Sleep(10);
    expect(Date.now() - start >= 10).toBe(true);
  });

  it("new helpers return default values", () => {
    expect(typeof GetTickCount64()).toBe("bigint");
    expect(GetMicrosecondCount()).toBeTypeOf("number");
    expect(PlaySound("a.wav")).toBe(true);
    expect(SendMail("a", "b", "c")).toBe(true);
    expect(SendNotification("n")).toBe(true);
    expect(SendFTP("f", "ftp")).toBe(true);
    expect(TerminalClose()).toBe(true);
    expect(ExpertRemove()).toBe(true);
    expect(DebugBreak()).toBe(0);
    expect(MessageBox("text")).toBe(1);
  });

  it("manages global variables", () => {
    GlobalVariablesDeleteAll();
    expect(GlobalVariablesTotal()).toBe(0);
    GlobalVariableSet("x", 5);
    expect(GlobalVariableGet("x")).toBe(5);
    expect(GlobalVariableCheck("x")).toBe(true);
    expect(GlobalVariableName(0)).toBe("x");
    expect(GlobalVariablesTotal()).toBe(1);
    const t = GlobalVariableTime("x");
    expect(t).toBeGreaterThan(0);
    expect(GlobalVariableSetOnCondition("x", 6, 5)).toBe(true);
    expect(GlobalVariableGet("x")).toBe(6);
    expect(GlobalVariableSetOnCondition("x", 7, 5)).toBe(false);
    expect(GlobalVariableDel("x")).toBe(true);
    expect(GlobalVariablesTotal()).toBe(0);
  });
});

describe("builtin signatures", () => {
  it("covers all implemented builtins", () => {
    const names = Object.keys({ ...coreBuiltins, ...envBuiltins });
    for (const name of names) {
      expect(builtinSignatures[name]).toBeDefined();
    }
  });
});
