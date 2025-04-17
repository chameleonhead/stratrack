import { describe, expect, it } from "vitest";
import { renderStrategyCode } from "./strategyCodeRenderer";
import { StrategyTemplate } from "../../dsl/strategy";

describe("renderStrategyCode", () => {
  const template: StrategyTemplate = {
    variables: [
      {
        name: "rsi14",
        expression: {
          type: "indicator",
          name: "RSI",
          params: [
            { name: "close", type: "source", value: "price" },
            { name: "period", type: "number", value: 14 },
          ],
          lineName: "rsi",
        },
      },
    ],
    entry: [
      {
        type: "long",
        condition: {
          type: "comparison",
          left: { type: "variable", name: "rsi14", valueType: "scalar" },
          operator: "<",
          right: { type: "constant", value: 30 },
        },
      },
    ],
    exit: [
      {
        type: "long",
        condition: {
          type: "comparison",
          left: { type: "variable", name: "rsi14", valueType: "scalar" },
          operator: ">",
          right: { type: "constant", value: 70 },
        },
      },
    ],
    riskManagement: {
      type: "fixed",
      lotSize: 1,
    },
  };

  it("generates Python class with correct structure", () => {
    const code = renderStrategyCode("python", template, []);

    expect(code).toContain("class GeneratedStrategy(bt.Strategy):");
    expect(code).toContain("  def __init__(self):");
    expect(code).toContain("    self.rsi14 = bt.indicators.RSI(self.data.close, period=14)");
    expect(code).toContain("  def next(self):");
    expect(code).toContain("    if not self.position:");
    expect(code).toContain("      if self.rsi14 < 30:");
    expect(code).toContain("        self.buy()");
    expect(code).toContain("    if self.position > 0:");
    expect(code).toContain("      if self.rsi14 > 70:");
    expect(code).toContain("        self.close()");
  });
});
