import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import VariableExpressionEditor from "./VariableExpressionEditor";

vi.mock("../../indicators/IndicatorProvider", () => ({
  useIndicatorList: () => [
    { name: "test", label: "Test", params: [], lines: [{ name: "l", label: "L" }] },
  ],
}));

vi.mock("./useVariables", () => ({
  useVariables: () => [],
}));

describe("VariableExpressionEditor", () => {
  it("renders indicator expression without throwing", () => {
    const expr = { type: "indicator", name: "test", params: [], lineName: "l" } as const;
    expect(() =>
      renderToString(<VariableExpressionEditor value={expr} onChange={() => {}} />)
    ).not.toThrow();
  });
});
