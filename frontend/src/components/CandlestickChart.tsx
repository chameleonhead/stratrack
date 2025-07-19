import React from "react";
import { ResponsiveContainer } from "recharts";
import { scaleLinear, scaleTime } from "d3-scale";

export type Candle = {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type CandlestickChartProps = {
  data: Candle[];
  width?: number;
  height?: number;
  range?: { from: number; to: number };
  limits?: { from: number; to: number };
  onRangeChange?: (range: { from: number; to: number }) => void;
};

const CandlestickChart = ({ data, width, height = 300, range }: CandlestickChartProps) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const resolvedHeight = isMobile ? 200 : height;
  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const rangeFrom = range?.from ?? sorted[0]?.date.getTime() ?? 0;
  const rangeTo = range?.to ?? sorted[sorted.length - 1]?.date.getTime() ?? 0;
  const filtered = sorted.filter(
    (c) => c.date.getTime() >= rangeFrom && c.date.getTime() <= rangeTo
  );

  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const onResize = (w: number, h: number) => setSize({ width: w, height: h });
  const x = scaleTime().domain([rangeFrom, rangeTo]).range([0, size.width]);
  const minLow = Math.min(...sorted.map((d) => d.low));
  const maxHigh = Math.max(...sorted.map((d) => d.high));
  const y = scaleLinear().domain([minLow, maxHigh]).range([size.height, 0]).nice();
  const candleW = filtered.length > 0 ? Math.max(1, size.width / filtered.length / 1.5) : 1;

  return (
    <div style={{ width: width ? `${width}px` : "100%", height: resolvedHeight }}>
      <ResponsiveContainer width="100%" height="100%" onResize={onResize}>
        <svg width={size.width} height={size.height} style={{ overflow: "visible" }}>
          {filtered.map((c, i) => {
            const xPos = x(c.date.getTime());
            const openY = y(c.open);
            const closeY = y(c.close);
            const highY = y(c.high);
            const lowY = y(c.low);
            const color = c.close >= c.open ? "#16a34a" : "#ef4444";
            return (
              <g key={i}>
                <line x1={xPos} x2={xPos} y1={highY} y2={lowY} stroke={color} />
                <rect
                  x={xPos - candleW / 2}
                  y={Math.min(openY, closeY)}
                  width={candleW}
                  height={Math.max(1, Math.abs(openY - closeY))}
                  fill={color}
                />
              </g>
            );
          })}
        </svg>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;
