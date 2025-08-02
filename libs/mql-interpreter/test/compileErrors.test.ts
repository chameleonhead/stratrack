import { compile, interpret } from "../src";
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

  it("warns when overriding a non-virtual method", () => {
    const result = compile(`
      class A { void foo(){} };
      class B : A { void foo(){} };
    `);
    const found = result.warnings.some((e) => e.message.includes("overrides non-virtual"));
    expect(found).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("warns when override keyword has no base method", () => {
    const result = compile(`
      class A { virtual void foo(){} };
      class B : A { void bar() override{} };
    `);
    const found = result.warnings.some((e) => e.message.includes("no base method"));
    expect(found).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("allows overriding virtual methods with override specifier", () => {
    const result = compile(`
      class A { virtual void foo(){} };
      class B : A { void foo() override{} };
    `);
    expect(result.errors.length).toBe(0);
    expect(result.warnings.length).toBe(0);
  });

  it("treats warnings as errors when requested", () => {
    const result = compile(`class A { void foo(){} }; class B : A { void foo(){} };`, {
      warningsAsErrors: true,
    });
    const found = result.errors.some((e) => e.message.includes("overrides non-virtual"));
    expect(found).toBe(true);
  });

  it("interpret throws when warnings are treated as errors", () => {
    expect(() =>
      interpret(`class A { void foo(){} }; class B : A { void foo(){} };`, undefined, {
        warningsAsErrors: true,
      })
    ).toThrow();
  });

  it("can suppress specific warnings", () => {
    const result = compile(`class A { void foo(){} }; class B : A { void foo(){} };`, {
      suppressWarnings: ["override-non-virtual"],
    });
    expect(result.warnings.length).toBe(0);
    expect(result.errors.length).toBe(0);
  });

  it("suppressed warnings are not treated as errors", () => {
    const result = compile(`class A { void foo(){} }; class B : A { void foo(){} };`, {
      warningsAsErrors: true,
      suppressWarnings: ["override-non-virtual"],
    });
    const found = result.errors.some((e) => e.code === "override-non-virtual");
    expect(found).toBe(false);
  });
});
