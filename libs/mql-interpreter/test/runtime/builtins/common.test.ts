import { createCommon } from "../../../src/libs/functions/common";
import { createGlobals } from "../../../src/libs/functions/globals";
import type { ExecutionContext } from "../../../src/libs/functions/types";
import { StructToTime } from "../../../src/libs/functions/dateandtime";
import { builtinSignatures } from "../../../src/libs/signatures";
import { coreBuiltins } from "../../../src/libs/functions/registry";
import { InMemoryTerminal as VirtualTerminal } from "../../../src/libs/domain/terminal";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("common builtins", () => {
  let context: ExecutionContext;
  let commonFuncs: ReturnType<typeof createCommon>;
  let globalFuncs: ReturnType<typeof createGlobals>;
  
  beforeEach(() => {
    const term = new VirtualTerminal();
    context = { 
      terminal: term, 
      broker: null, 
      account: null, 
      market: null, 
      symbol: "TEST", 
      timeframe: 60, 
      indicators: undefined
    };
    commonFuncs = createCommon(context);
    globalFuncs = createGlobals(context);
  });
  it("Print and Comment output and return 0", () => {
    expect(commonFuncs.Print("a")).toBe(0);
    expect(commonFuncs.Comment("b")).toBe(0);
  });

  it("Print formats datetime values", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const t = StructToTime({ year: 2000, mon: 1, day: 2, hour: 3, min: 4, sec: 5 });
    commonFuncs.Print(t);
    expect(spy).toHaveBeenCalledWith("2000.01.02 03:04:05");
    spy.mockRestore();
  });

  it("Alert returns true", () => {
    expect(commonFuncs.Alert("x")).toBe(true);
  });

  it("PrintFormat formats strings", () => {
    expect(commonFuncs.PrintFormat("num %d", 5)).toBe(0);
  });

  it("GetTickCount returns increasing time", async () => {
    const a = commonFuncs.GetTickCount();
    await new Promise((r) => setTimeout(r, 10));
    const b = commonFuncs.GetTickCount();
    expect(b >= a).toBe(true);
  });

  it("Sleep waits at least specified time", () => {
    const start = Date.now();
    commonFuncs.Sleep(10);
    expect(Date.now() - start >= 10).toBe(true);
  });

  it("new helpers return default values", () => {
    expect(typeof commonFuncs.GetTickCount64()).toBe("bigint");
    expect(commonFuncs.GetMicrosecondCount()).toBeTypeOf("number");
    expect(commonFuncs.PlaySound("a.wav")).toBe(true);
    expect(commonFuncs.SendMail("a", "b", "c")).toBe(true);
    expect(commonFuncs.SendNotification("n")).toBe(true);
    expect(commonFuncs.SendFTP("f", "ftp")).toBe(true);
    expect(commonFuncs.TerminalClose()).toBe(true);
    expect(commonFuncs.ExpertRemove()).toBe(true);
    expect(commonFuncs.DebugBreak()).toBe(0);
    expect(commonFuncs.MessageBox("text")).toBe(1);
  });

  it("terminal info helpers return defaults", () => {
    expect(commonFuncs.TerminalCompany()).toBe("MetaQuotes Software Corp.");
    expect(commonFuncs.TerminalName()).toBe("MetaTrader");
    expect(commonFuncs.TerminalPath()).toBe("");
    expect(commonFuncs.IsConnected()).toBe(true);
    expect(commonFuncs.IsTesting()).toBe(false);
    expect(commonFuncs.IsOptimization()).toBe(false);
    expect(commonFuncs.IsVisualMode()).toBe(false);
    expect(commonFuncs.IsDemo()).toBe(false);
    expect(commonFuncs.IsTradeAllowed()).toBe(true);
    expect(commonFuncs.IsTradeContextBusy()).toBe(false);
    expect(commonFuncs.UninitializeReason()).toBe(0);
  });

  it("manages global variables", () => {
    globalFuncs.GlobalVariablesDeleteAll();
    expect(globalFuncs.GlobalVariablesTotal()).toBe(0);
    globalFuncs.GlobalVariableSet("x", 5);
    expect(globalFuncs.GlobalVariableGet("x")).toBe(5);
    expect(globalFuncs.GlobalVariableCheck("x")).toBe(true);
    expect(globalFuncs.GlobalVariableName(0)).toBe("x");
    expect(globalFuncs.GlobalVariablesTotal()).toBe(1);
    const t = globalFuncs.GlobalVariableTime("x");
    expect(t).toBeGreaterThan(0);
    expect(globalFuncs.GlobalVariableSetOnCondition("x", 6, 5)).toBe(true);
    expect(globalFuncs.GlobalVariableGet("x")).toBe(6);
    expect(globalFuncs.GlobalVariableSetOnCondition("x", 7, 5)).toBe(false);
    expect(globalFuncs.GlobalVariableDel("x")).toBe(true);
    expect(globalFuncs.GlobalVariablesTotal()).toBe(0);
    globalFuncs.GlobalVariableSet("pref_y", 1);
    globalFuncs.GlobalVariableSet("pref_z", 1);
    expect(globalFuncs.GlobalVariablesDeleteAll("pref_")).toBe(2);
  });

  it("misc helpers handle requests and flush", () => {
    const res = { value: "foo" };
    expect(commonFuncs.WebRequest("GET", "http://example.com", ["h"], "", 1000, res)).toBe(-1);
    expect(res.value).toBe("");
    globalFuncs.GlobalVariableSet("tmp", 1);
    globalFuncs.GlobalVariableTemp("tmp", 2);
    expect(globalFuncs.GlobalVariableGet("tmp")).toBe(2);
    expect(globalFuncs.GlobalVariablesFlush()).toBe(0);
  });
});

describe("builtin signatures", () => {
  it("covers all implemented builtins", () => {
    const names = Object.keys(coreBuiltins);
    for (const name of names) {
      expect(builtinSignatures[name]).toBeDefined();
    }
  });
});
