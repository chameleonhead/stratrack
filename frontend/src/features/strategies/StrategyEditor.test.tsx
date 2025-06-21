import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import StrategyEditor from "./StrategyEditor";
import { StrategyTemplate } from "../../codegen/dsl/strategy";

vi.mock("../../components/CodeEditor", () => ({
  default: () => null,
}));
vi.mock("../indicators/IndicatorProvider", () => ({
  useIndicatorList: () => [],
}));

describe("StrategyEditor", () => {
  it("renders with empty template without throwing", () => {
    expect(() =>
      renderToString(<StrategyEditor value={{ template: {} }} />)
    ).not.toThrow();
  });

  it("handles missing numeric values", () => {
    expect(() =>
      renderToString(
        <StrategyEditor
          value={{
            template: {
              riskManagement: { type: "fixed" },
              positionManagement: {
                takeProfit: { enabled: true },
                stopLoss: { enabled: true },
                trailingStop: { enabled: true },
              },
              multiPositionControl: { allowHedging: true },
            } as Partial<StrategyTemplate>,
          }}
        />
      )
    ).not.toThrow();
  });
});

