// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { useEffect, type ReactNode } from "react";
import CandlestickChart, { Candle, Indicator } from "./CandlestickChart";
import { vi, describe, it, expect, beforeAll } from "vitest";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({
    onResize,
    children,
  }: {
    onResize?: (width: number, height: number) => void;
    children: ReactNode;
  }) => {
    useEffect(() => {
      onResize?.(300, 150);
    }, [onResize]);
    return <div style={{ width: 300, height: 150 }}>{children}</div>;
  },
}));

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("CandlestickChart", () => {
  it("includes overlay indicator values in y-scale", () => {
    const data: Candle[] = [
      { date: new Date(0), open: 1, high: 2, low: 1, close: 1.5 },
      { date: new Date(1), open: 1.4, high: 2, low: 1.2, close: 1.6 },
    ];
    const indicators: Indicator[] = [
      {
        name: "MA",
        data: [
          { date: new Date(0), value: 10 },
          { date: new Date(1), value: 10 },
        ],
      },
    ];
    const { container } = render(
      <CandlestickChart
        data={data}
        indicators={indicators}
        range={{ from: data[0].date.getTime(), to: data[1].date.getTime() }}
      />
    );
    const yLabels = Array.from(container.querySelectorAll("text"))
      .map((el) => parseFloat(el.textContent || "NaN"))
      .filter((v) => !Number.isNaN(v));
    const maxTick = Math.max(...yLabels);
    expect(maxTick).toBeGreaterThanOrEqual(10);
  });
});
