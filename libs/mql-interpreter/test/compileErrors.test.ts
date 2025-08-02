import { compile } from "../src";
import { describe, it, expect } from "vitest";

describe("compile errors", () => {
  it("reports unknown types", () => {
    const result = compile("Foo x;");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("reports unknown parameter types", () => {
    const result = compile("void foo(Bogus a);");
    const found = result.errors.some((e) =>
      e.message.includes("Unknown type Bogus for parameter a")
    );
    expect(found).toBe(true);
  });

  it("skips type checking when syntax errors exist", () => {
    const result = compile("void f(");
    expect(result.errors.length).toBe(1);
  });

  it("errors when overriding a non-virtual method", () => {
    const result = compile(`
      class A { void foo(){} };
      class B : A { void foo(){} };
    `);
    const found = result.errors.some((e) => e.message.includes("overrides non-virtual"));
    expect(found).toBe(true);
  });

  it("errors when override keyword has no base method", () => {
    const result = compile(`
      class A { virtual void foo(){} };
      class B : A { void bar() override{} };
    `);
    const found = result.errors.some((e) => e.message.includes("no base method"));
    expect(found).toBe(true);
  });

  it("allows overriding virtual methods with override specifier", () => {
    const result = compile(`
      class A { virtual void foo(){} };
      class B : A { void foo() override{} };
    `);
    expect(result.errors.length).toBe(0);
  });
});
