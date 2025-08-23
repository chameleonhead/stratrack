import { lex } from "../../src/parser/lexer";
import { parse } from "../../src/parser/parser";
import { execute, callFunction } from "../../src/runtime/runtime";
import { registerEnvBuiltins } from "../../src/libs/functions";
import { createCommon } from "../../src/libs/functions/common";
import type { ExecutionContext } from "../../src/libs/functions/types";
import { describe, it, expect, beforeAll } from "vitest";

const code = 'void myfunc(string s="hi") { return; }';
const runtime = execute(parse(lex(code).tokens));

// Set up Print function for tests
beforeAll(() => {
  const context: ExecutionContext = {
    terminal: null,
    broker: null,
    account: null,
    market: null,
    symbol: "TEST",
    timeframe: 60,
    indicators: undefined,
  };
  const commonFuncs = createCommon(context);
  registerEnvBuiltins(commonFuncs);
});

describe("callFunction", () => {
  it("throws when function missing", () => {
    expect(() => callFunction(runtime, "unknown")).toThrow("Function unknown not found");
  });

  it("applies default parameter", () => {
    expect(() => callFunction(runtime, "myfunc")).not.toThrow();
  });

  it("checks argument count", () => {
    expect(() => callFunction(runtime, "myfunc", ["a", "b"])).toThrow("Too many arguments");
  });

  it("invokes builtin without signature", () => {
    expect(callFunction(runtime, "Print", ["test"])).toBe(0);
  });

  it("handles overloaded functions", () => {
    const r = execute(
      parse(lex("void foo() { return; } void foo(int a, int b=1) { return; }").tokens)
    );
    expect(() => callFunction(r, "foo")).not.toThrow();
    expect(() => callFunction(r, "foo", [1])).not.toThrow();
    expect(() => callFunction(r, "foo", [1, 2, 3])).toThrow("Too many arguments");
  });

  it("checks reference argument type", () => {
    const r = execute(parse(lex("void mod(int &v) { return; }").tokens));
    expect(() => callFunction(r, "mod", [1])).toThrow("Argument v must be passed by reference");
  });

  it("validates primitive argument types", () => {
    const r = execute(parse(lex("void foo(int a, string b) { return; }").tokens));
    expect(() => callFunction(r, "foo", ["x", "y"])).toThrow("Argument a expected int");
    // Note: checkPrimitive allows number->string conversion, so this won't throw
    expect(() => callFunction(r, "foo", [1, 2])).not.toThrow();
  });

  it("passes reference object to builtin", () => {
    const r = execute(parse(lex("void StringTrimLeft(string &s);").tokens));
    const ref = { value: "  hi" };
    callFunction(r, "StringTrimLeft", [ref]);
    expect(ref.value).toBe("hi");
  });
});
