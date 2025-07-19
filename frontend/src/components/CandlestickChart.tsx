import React from "react";
import { ResponsiveContainer } from "recharts";
import { line as d3Line } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";

export type Candle = {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Indicator = {
  name: string;
  color?: string;
  data: { date: Date; value: number }[];
};

export type BacktestTrade = {
  date: Date;
  price: number;
  type: "buy" | "sell";
};

export type CandlestickChartProps = {
  data: Candle[];
  width?: number;
  height?: number;
  range?: { from: number; to: number };
  indicators?: Indicator[];
  trades?: BacktestTrade[];
  onRangeChange?: (range: { from: number; to: number }) => void;
};

const CandlestickChart = ({
  data,
  width,
  height = 300,
  range,
  indicators,
  trades,
}: CandlestickChartProps) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const resolvedHeight = isMobile ? 200 : height;
  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const from = range?.from ?? sorted[0]?.date.getTime() ?? 0;
  const to = range?.to ?? sorted[sorted.length - 1]?.date.getTime() ?? 0;
  const filtered = sorted.filter((c) => c.date.getTime() >= from && c.date.getTime() <= to);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const onResize = (w: number, h: number) => setSize({ width: w, height: h });

  const xScale = scaleTime().domain([from, to]).range([0, size.width]);
  const minLow = Math.min(...filtered.map((d) => d.low));
  const maxHigh = Math.max(...filtered.map((d) => d.high));
  const yScale = scaleLinear().domain([minLow, maxHigh]).range([size.height, 0]).nice();
  const candleW = filtered.length > 0 ? Math.max(1, size.width / filtered.length / 1.5) : 1;

  const indLines = indicators?.map((ind) => ({
    color: ind.color || "#0ea5e9",
    path:
      d3Line<{ date: Date; value: number }>()
        .x((d) => xScale(d.date.getTime()))
        .y((d) => yScale(d.value))(ind.data) ?? "",
  }));
  const tradeItems = trades?.filter((t) => t.date.getTime() >= from && t.date.getTime() <= to);

  return (
    <div style={{ width: width ? `${width}px` : "100%", height: resolvedHeight }}>
      <ResponsiveContainer width="100%" height="100%" onResize={onResize}>
        <svg width={size.width} height={size.height} style={{ overflow: "visible" }}>
          {filtered.map((c, i) => {
            const x = xScale(c.date.getTime());
            const openY = yScale(c.open);
            const closeY = yScale(c.close);
            const highY = yScale(c.high);
            const lowY = yScale(c.low);
            const color = c.close >= c.open ? "#16a34a" : "#ef4444";
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} />
                <rect
                  x={x - candleW / 2}
                  y={Math.min(openY, closeY)}
                  width={candleW}
                  height={Math.max(1, Math.abs(openY - closeY))}
                  fill={color}
                />
              </g>
            );
          })}
          {indLines?.map((ind, idx) => (
            <path key={idx} d={ind.path} fill="none" stroke={ind.color} />
          ))}
          {tradeItems?.map((t, idx) => {
            const x = xScale(t.date.getTime());
            const y = yScale(t.price);
            const size = 6;
            const points =
              t.type === "buy"
                ? `${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`
                : `${x},${y + size} ${x - size},${y - size} ${x + size},${y - size}`;
            return <polygon key={idx} points={points} fill="#eab308" />;
          })}
        </svg>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;
