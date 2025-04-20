import { describe, test, expect } from "vitest";
import { analyzeStrategyWithDependencies } from "../analyzers/index";
import { StrategyTemplate } from "../dsl/strategy";
import { Indicator } from "../dsl/indicator";

const sampleIndicator: Indicator = {
  name: "sma",
  label: "Simple Moving Average",
  params: [
    { type: "source", name: "input", label: "Input", required: true },
    { type: "number", name: "length", label: "Length", required: true, default: 14 },
  ],
  lines: [{ name: "sma", label: "SMA" }],
  defaultLineName: "sma",
  template: {
    variables: [
      {
        name: "sma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "input", valueType: "bar" },
          period: { type: "param", name: "length", valueType: "scalar" },
          valueType: "scalar",
        },
      },
    ],
    exports: [{ name: "sma", variableName: "sma" }],
  },
};

const sampleStrategy: StrategyTemplate = {
  variables: [
    {
      name: "price",
      expression: {
        type: "scalar_price",
        source: "close",
        valueType: "scalar",
      },
    },
  ],
  entry: [
    {
      type: "long",
      condition: {
        type: "comparison",
        operator: ">",
        left: {
          type: "indicator",
          name: "sma",
          params: [
            {
              type: "source",
              name: "input",
              ref: { type: "variable", name: "price", valueType: "bar" },
            },
            { type: "number", name: "length", value: 14 },
          ],
          lineName: "sma",
          valueType: "scalar",
        },
        right: { type: "constant", value: 100, valueType: "scalar" },
      },
    },
  ],
  exit: [],
  riskManagement: { type: "fixed", lotSize: 0.1 },
};

describe("analyzeStrategyWithDependencies", () => {
  test("should analyze a strategy with single SMA indicator", () => {
    const result = analyzeStrategyWithDependencies(sampleStrategy, { sma: sampleIndicator });

    expect(result.errors).toEqual([]);
    expect(result.indicatorDefinitions.length).toBe(1);
    expect(result.indicatorDefinitions[0].name).toBe("sma");
    expect(result.indicatorInstances.length).toBe(1);
    expect(result.indicatorInstances[0].name).toBe("sma");
    expect(result.indicatorInstances[0].params).toEqual([
      {
        name: "input",
        ref: {
          name: "price",
          type: "variable",
          valueType: "bar",
        },
        type: "source",
      },
      {
        name: "length",
        type: "number",
        value: 14,
      },
    ]);
    expect(Array.from(result.usedAggregationTypes)).toContain("sma");
    expect(result.variableDependencyOrder).toContain("price");
  });
});
