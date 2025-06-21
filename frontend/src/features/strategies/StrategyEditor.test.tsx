import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import StrategyEditor from "./StrategyEditor";

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
});

