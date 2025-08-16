import { preprocess, preprocessWithProperties } from "../src/core/parser/preprocess";
import { parse } from "../src/core/parser/parser";
import { execute } from "../src/core/runtime";
import { describe, it, expect } from "vitest";

describe("preprocess", () => {
  it("expands defined constants", () => {
    const code = "#define SIZE 5\nclass A { int arr[SIZE]; }";
    const tokens = preprocess(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.A.fields.arr).toEqual({ type: "int", dimensions: [5], static: false });
  });

  it("supports undef", () => {
    const code = "#define A 1\n#undef A\nclass B { int v=A; }";
    const tokens = preprocess(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    // A should remain identifier since it was undefined
    expect(Object.keys(runtime.classes)).toEqual(["B"]);
  });

  it("captures program properties", () => {
    const code = '#property version "1.0"\nclass A{}';
    const { tokens, properties } = preprocessWithProperties(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(properties.version).toEqual(['"1.0"']);
    expect(Object.keys(runtime.classes)).toEqual(["A"]);
  });

  it("imports external files", () => {
    const code = '#import "lib.mqh"\n#import\nclass B{}';
    const { tokens: tks, properties } = preprocessWithProperties(code, {
      fileProvider: (p) => (p === "lib.mqh" ? '#property note "x"\nclass A{}' : undefined),
    });
    const ast = parse(tks);
    const runtime = execute(ast);
    expect(properties.note).toEqual(['"x"']);
    expect(Object.keys(runtime.classes)).toEqual(["A", "B"]);
  });

  it("throws when imported file missing", () => {
    const code = '#import "missing.mqh"\n#import';
    expect(() => preprocess(code, { fileProvider: () => undefined })).toThrow("missing.mqh");
  });

  it("handles #ifdef blocks", () => {
    const code = "#define FLAG\n#ifdef FLAG\nclass A{}\n#else\nclass B{}\n#endif";
    const tokens = preprocess(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(Object.keys(runtime.classes)).toEqual(["A"]);
  });

  it("handles #ifndef with else", () => {
    const code = "#define A\n#ifndef A\nclass X{}\n#else\nclass Y{}\n#endif";
    const tokens = preprocess(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(Object.keys(runtime.classes)).toEqual(["Y"]);
  });

  it("supports nested conditionals", () => {
    const code = "#define A\n#ifdef A\n#ifndef B\nclass C{}\n#endif\n#endif";
    const tokens = preprocess(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(Object.keys(runtime.classes)).toEqual(["C"]);
  });

  it("expands parameterized macros", () => {
    const tokens = preprocess("#define ADD(x,y) x+y\nADD(1,2);");
    const values = tokens.map((t) => t.value).join(" ");
    expect(values).toBe("1 + 2 ;");
  });
});
