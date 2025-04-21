import { describe, it, expect } from "vitest";
import { PyModule } from "./ast";
import { mod, cls, func, assign, ref, lit } from "./helper";
import { renderPythonBtProgram } from "./renderer";

describe("renderPythonBtProgram", () => {
  it("should render a simple class with method", () => {
    const module: PyModule = mod(
      [cls("MyClass", [func("__init__", ["self"], [assign(ref("self.x"), lit(10))])])],
      ["import backtrader as bt"]
    );

    const result = renderPythonBtProgram(module);

    expect(result).toBe(
      `import backtrader as bt\n\n` +
        `class MyClass:\n` +
        `  def __init__(self):\n` +
        `    self.x = 10`
    );
  });

  it("should render a class with if statement", () => {
    const module: PyModule = mod([
      cls("MyStrategy", [
        func(
          "next",
          ["self"],
          [
            {
              type: "if",
              condition: {
                type: "compare",
                left: ref("self.x"),
                operators: [">"],
                comparators: [lit(0)],
              },
              thenBody: [
                {
                  type: "expr_stmt",
                  expression: {
                    type: "call",
                    function: ref("print"),
                    args: [lit("Positive")],
                  },
                },
              ],
            },
          ]
        ),
      ]),
    ]);

    const result = renderPythonBtProgram(module);

    expect(result).toContain("if self.x > 0:");
    expect(result).toContain('print("Positive")');
  });
});
