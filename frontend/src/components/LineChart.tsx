import React from "react";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export type LinePoint = { x: number; y: number };

export type LineChartProps = {
  width?: number;
  height?: number;
  data: LinePoint[];
  range?: { from: number; to: number };
  onRangeChange?: (range: { from: number; to: number }) => void;
};

const LineChart = ({ width, height = 300, data, range, onRangeChange }: LineChartProps) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const resolvedHeight = isMobile ? 200 : height;
  const defaultRange = React.useMemo(() => {
    if (data.length === 0) return { from: 0, to: 0 };
    const endIdx = data.length - 1;
    const startIdx = Math.max(0, endIdx - 99);
    return { from: data[startIdx].x, to: data[endIdx].x };
  }, [data]);
  const from = range?.from ?? defaultRange.from;
  const to = range?.to ?? defaultRange.to;
  const filtered = data.filter((p) => p.x >= from && p.x <= to);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const onResize = (w: number, h: number) => setSize({ width: w, height: h });
  const dragStart = React.useRef<number | null>(null);
  const dragRange = React.useRef<{ from: number; to: number } | null>(null);

  const moveRange = (ratio: number) => {
    if (!onRangeChange) return;
    const widthMs = to - from;
    onRangeChange({ from: from + widthMs * ratio, to: to + widthMs * ratio });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!onRangeChange) return;
    e.preventDefault();
    const ratio = (e.deltaY > 0 ? 1 : -1) * 0.1;
    moveRange(ratio);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientX;
    dragRange.current = { from, to };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current == null || !dragRange.current || !onRangeChange) return;
    const dx = e.clientX - dragStart.current;
    const ratio = -dx / size.width;
    const widthMs = dragRange.current.to - dragRange.current.from;
    onRangeChange({
      from: dragRange.current.from + widthMs * ratio,
      to: dragRange.current.to + widthMs * ratio,
    });
  };

  const endDrag = () => {
    dragStart.current = null;
    dragRange.current = null;
  };
  return (
    <div
      style={{ width: width ? `${width}px` : "100%", height: resolvedHeight }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <ResponsiveContainer width="100%" height="100%" onResize={onResize}>
        <ReLineChart data={filtered} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => new Date(v).toLocaleString()}
          />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip labelFormatter={(value) => new Date(value as number).toLocaleString()} />
          <Line type="monotone" dataKey="y" stroke="#3b82f6" dot={false} />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
