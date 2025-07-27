import { lex } from "../src/lexer";
import { parse } from "../src/parser";
import { execute, callFunction, instantiate, callMethod } from "../src/runtime";
import { executeStatements } from "../src/statements";
import { describe, it, expect, vi } from "vitest";

describe("execute", () => {
  it("evaluates enums", () => {
    const { tokens } = lex("enum Color { Red=1, Green, Blue };");
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.enums.Color).toEqual({ Red: 1, Green: 2, Blue: 3 });
  });

  it("stores classes with inheritance when base exists", () => {
    const { tokens } = lex("class Parent {} class Child : Parent {}");
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.Child).toEqual({
      abstract: false,
      base: "Parent",
      fields: {},
      methods: [],
    });
  });

  it("stores class fields", () => {
    const { tokens } = lex("class A { int a; string b; }");
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.A).toEqual({
      abstract: false,
      base: undefined,
      fields: {
        a: { type: "int", dimensions: [], static: false },
        b: { type: "string", dimensions: [], static: false },
      },
      methods: [],
    });
  });

  it("stores structs", () => {
    const { tokens } = lex("struct S { int a; };");
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.S.fields.a).toEqual({ type: "int", dimensions: [], static: false });
  });

  it("stores dynamic array fields", () => {
    const { tokens } = lex("class A { double arr[]; }");
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.A.fields.arr).toEqual({
      type: "double",
      dimensions: [null],
      static: false,
    });
  });

  it("instantiates classes with inheritance", () => {
    const code = "class P{int a;} class C:P{double b;}";
    const runtime = execute(parse(lex(code).tokens));
    const obj = instantiate(runtime, "C");
    expect(Object.keys(obj)).toEqual(["a", "b"]);
  });

  it("stores static and virtual flags", () => {
    const code = "class S{ static int c; virtual void tick(); static void util(); }";
    const runtime = execute(parse(lex(code).tokens));
    expect(runtime.classes.S.fields.c.static).toBe(true);
    expect(runtime.classes.S.methods[0].virtual).toBe(true);
    expect(runtime.classes.S.methods[1].static).toBe(true);
  });

  it("stores abstract and pure virtual info", () => {
    const code = "abstract class B{ virtual void f()=0; };";
    const runtime = execute(parse(lex(code).tokens));
    expect(runtime.classes.B.abstract).toBe(true);
    expect(runtime.classes.B.methods[0].pure).toBe(true);
  });

  it("stores class methods including operators", () => {
    const code = "class M{int add(int v); double operator+(double b); M();}";
    const runtime = execute(parse(lex(code).tokens));
    const methods = runtime.classes.M.methods;
    expect(methods.map((m) => m.name)).toEqual(["add", "operator+", "M"]);
    expect(methods[0].parameters[0].type).toBe("int");
    expect(methods[1].returnType).toBe("double");
  });

  it("stores functions", () => {
    const { tokens } = lex("double lin(double a,double b){return a+b;}");
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.functions.lin[0].returnType).toBe("double");
    expect(runtime.functions.lin[0].parameters).toEqual([
      { type: "double", byRef: false, name: "a", dimensions: [], defaultValue: undefined },
      { type: "double", byRef: false, name: "b", dimensions: [], defaultValue: undefined },
    ]);
  });

  it("stores reference parameter info", () => {
    const { tokens } = lex("void modify(int &ref, double vals[]);");
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.functions.modify[0].parameters).toEqual([
      { type: "int", byRef: true, name: "ref", dimensions: [], defaultValue: undefined },
      { type: "double", byRef: false, name: "vals", dimensions: [null], defaultValue: undefined },
    ]);
  });

  it("stores overloaded functions", () => {
    const { tokens } = lex("void f(); void f(int a);");
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.functions.f.length).toBe(2);
  });

  it("stores template parameters", () => {
    const code = "template<typename T> class Box{}; template<class U> U max(U a,U b);";
    const runtime = execute(parse(lex(code).tokens));
    expect(runtime.classes.Box.templateParams).toEqual(["T"]);
    expect(runtime.functions.max[0].templateParams).toEqual(["U"]);
  });

  it("throws when base class is missing", () => {
    const { tokens } = lex("class Child : Parent {}");
    const ast = parse(tokens);
    expect(() => execute(ast)).toThrowError("Base class Parent not found");
  });

  it("executes control flow statements", () => {
    const env = { sum: 0, i: 0 };
    executeStatements("for(i=0;i<3;i++){ if(i==1) continue; sum+=i; }", env);
    expect(env.sum).toBe(2);
    executeStatements("i=0; while(i<2){ i++; if(i==1) break; }", env);
    expect(env.i).toBe(1);
    executeStatements("do{i++;}while(i<2);", env);
    expect(env.i).toBe(2);
    executeStatements("switch(i){ case 2: sum=10; break; default: sum=0; }", env);
    expect(env.sum).toBe(10);
  });

  it("handles visibility specifiers", () => {
    const code = "class A{public: int x; private: int y;} struct S{private: int a; public: int b;}";
    const runtime = execute(parse(lex(code).tokens));
    expect(Object.keys(runtime.classes.A.fields)).toEqual(["x", "y"]);
    expect(Object.keys(runtime.classes.S.fields)).toEqual(["a", "b"]);
  });

  it("stores global variables", () => {
    const code = "static double g; input int period=10;";
    const runtime = execute(parse(lex(code).tokens));
    expect(runtime.variables.g.storage).toBe("static");
    expect(runtime.variables.period.storage).toBe("input");
    expect(runtime.variables.period.initialValue).toBe("10");
  });

  it("executes entry point builtin", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const runtime = execute([], { entryPoint: "Print" });
    expect(runtime.enums).toEqual({});
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("passes arguments to entry point", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    execute([], { entryPoint: "Print", args: ["a", 1] });
    expect(spy).toHaveBeenCalledWith("a", 1);
    spy.mockRestore();
  });

  it("stores execution context on the runtime", () => {
    const ctx = { entryPoint: "Print", args: ["x"] };
    const runtime = execute([], ctx);
    expect(runtime.context).toEqual(expect.objectContaining(ctx));
  });

  it("throws when entry point missing", () => {
    expect(() => execute([], { entryPoint: "Unknown" })).toThrow("Function Unknown not found");
  });

  it("initializes extern and input values from context", () => {
    const ast = parse(lex("extern int E; input double P=1.5;").tokens);
    const runtime = execute(ast, { externValues: { E: 3 }, inputValues: { P: 2 } });
    expect(runtime.globalValues.E).toBe(3);
    expect(runtime.globalValues.P).toBe(2);
  });

  it("leaves extern undefined when not supplied", () => {
    const ast = parse(lex("extern int E;").tokens);
    const runtime = execute(ast);
    expect(runtime.globalValues.E).toBeUndefined();
  });

  it("initializes and preserves static locals", () => {
    const code = "int f(){ static int c=1; c++; return c; }";
    const runtime = execute(parse(lex(code).tokens));
    expect(callFunction(runtime, "f")).toBe(2);
    expect(runtime.staticLocals.f.c).toBe(2);
    expect(callFunction(runtime, "f")).toBe(3);
    expect(runtime.staticLocals.f.c).toBe(3);
  });

  it("executes user-defined function body", () => {
    const code = "int add(int a,int b){ int c=a+b; return c; }";
    const runtime = execute(parse(lex(code).tokens));
    expect(callFunction(runtime, "add", [2, 3])).toBe(5);
  });

  it("executes class and struct methods", () => {
    const code = "class C{int v; void inc(){ v++; }} struct S{int v; int get(){ return v; }}";
    const runtime = execute(parse(lex(code).tokens));
    const c = instantiate(runtime, "C");
    callMethod(runtime, "C", "inc", c);
    expect(c.v).toBe(1);
    const s = instantiate(runtime, "S");
    s.v = 3;
    expect(callMethod(runtime, "S", "get", s)).toBe(3);
  });

  it("keeps global variables when locals share the same name", () => {
    const code = "int g=5; int f(){ int g=1; g++; return g; }";
    const runtime = execute(parse(lex(code).tokens));
    expect(callFunction(runtime, "f")).toBe(2);
    expect(runtime.globalValues.g).toBe(5);
  });
});
