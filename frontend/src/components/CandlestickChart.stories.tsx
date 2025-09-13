import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, fireEvent, expect } from "storybook/test";
import CandlestickChart from "./CandlestickChart";

const meta: Meta<typeof CandlestickChart> = {
  component: CandlestickChart,
  args: {
    onRangeChange: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof CandlestickChart>;

export const Default: Story = {
  args: {
    width: 300,
    height: 150,
    data: [
      { date: new Date(0), open: 1, high: 1.2, low: 0.8, close: 1.1 },
      { date: new Date(1), open: 1.1, high: 1.3, low: 1.0, close: 1.0 },
      { date: new Date(2), open: 1.0, high: 1.2, low: 0.9, close: 1.15 },
      { date: new Date(3), open: 1.15, high: 1.25, low: 1.05, close: 1.1 },
    ],
    indicators: [
      {
        name: "MA",
        color: "#3b82f6",
        data: [
          { date: new Date(0), value: 1.05 },
          { date: new Date(1), value: 1.08 },
          { date: new Date(2), value: 1.1 },
          { date: new Date(3), value: 1.12 },
        ],
      },
    ],
    trades: [
      { date: new Date(1), price: 1.1, type: "buy" },
      { date: new Date(2), price: 1.15, type: "sell" },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const svg = canvasElement.querySelector("svg") as SVGSVGElement;
    const paths = svg.querySelectorAll("path");
    await expect(paths.length).toBeGreaterThan(0);
    fireEvent.wheel(svg, { deltaY: 100 });
    await expect(args.onRangeChange).toHaveBeenCalled();
  },
};

export const Tooltip: Story = {
  args: {
    width: 300,
    height: 200,
    data: Array.from({ length: 120 }, (_, i) => ({
      date: new Date(i * 60 * 1000),
      open: 1 + Math.sin(i / 10) * 0.05,
      high: 1.1 + Math.sin(i / 10) * 0.05,
      low: 0.9 + Math.sin(i / 10) * 0.05,
      close: 1 + Math.sin((i + 1) / 10) * 0.05,
    })),
  },
  play: async ({ canvasElement }) => {
    const firstBar = canvasElement.querySelector("rect") as SVGRectElement;
    fireEvent.click(firstBar);
    await expect(canvasElement.querySelector("foreignObject")).not.toBeNull();
  },
};

export const WithSubchart: Story = {
  args: {
    width: 300,
    height: 150,
    data: Array.from({ length: 50 }, (_, i) => ({
      date: new Date(i * 60 * 1000),
      open: 1 + Math.sin(i / 5) * 0.05,
      high: 1.1 + Math.sin(i / 5) * 0.05,
      low: 0.9 + Math.sin(i / 5) * 0.05,
      close: 1 + Math.sin((i + 1) / 5) * 0.05,
    })),
    indicators: [
      {
        name: "MA",
        color: "#3b82f6",
        data: Array.from({ length: 50 }, (_, i) => ({
          date: new Date(i * 60 * 1000),
          value: 1 + Math.sin(i / 5) * 0.04,
        })),
      },
      {
        name: "RSI",
        color: "#10b981",
        pane: 1,
        data: Array.from({ length: 50 }, (_, i) => ({
          date: new Date(i * 60 * 1000),
          value: 50 + Math.sin(i / 5) * 10,
        })),
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const svgs = canvasElement.querySelectorAll("svg");
    fireEvent.wheel(svgs[1], { deltaY: 100 });
    await expect(args.onRangeChange).toHaveBeenCalled();
  },
};
