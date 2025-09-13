import React from "react";
import { ResponsiveContainer } from "recharts";
import { line as d3Line } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";

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
  /**
   * 0 or undefined means overlay on main chart. Higher numbers show in
   * separate subcharts stacked below the main candlestick chart.
   */
  pane?: number;
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

const AXIS_HEIGHT = 20;
const LEFT_MARGIN = 40;

type SubChartProps = {
  pane: number;
  indicators: Indicator[];
  range: { from: number; to: number };
  formatTick: (d: Date) => string;
  handlePointerDown: (e: React.PointerEvent<SVGSVGElement>) => void;
  handlePointerMoveGeneric: (e: React.PointerEvent<SVGSVGElement>, width: number) => void;
  handleWheel: (e: React.WheelEvent<SVGSVGElement>) => void;
  endDrag: () => void;
};

const SubChart = ({
  pane,
  indicators,
  range,
  formatTick,
  handlePointerDown,
  handlePointerMoveGeneric,
  handleWheel,
  endDrag,
}: SubChartProps) => {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const onResize = (w: number, h: number) => setSize({ width: w, height: h });
  const chartHeight = Math.max(0, size.height - AXIS_HEIGHT);
  const xScale = scaleTime().domain([range.from, range.to]).range([LEFT_MARGIN, size.width]);
  const values = indicators.flatMap((i) =>
    i.data
      .filter((p) => p.date.getTime() >= range.from && p.date.getTime() <= range.to)
      .map((p) => p.value)
  );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const yScale = scaleLinear().domain([min, max]).range([chartHeight, 0]).nice();
  const yTicks = yScale.ticks(5);
  const ticks = xScale.ticks(Math.max(2, Math.floor((size.width - LEFT_MARGIN) / 80)));
  const paths = indicators.map((ind) => ({
    color: ind.color || "#0ea5e9",
    path:
      d3Line<{ date: Date; value: number }>()
        .x((d) => xScale(d.date.getTime()))
        .y((d) => yScale(d.value))(
        ind.data.filter((p) => p.date.getTime() >= range.from && p.date.getTime() <= range.to)
      ) ?? "",
  }));
  return (
    <div key={`pane-${pane}`} style={{ height: 100 + AXIS_HEIGHT }}>
      <ResponsiveContainer width="100%" height="100%" onResize={onResize}>
        <svg
          width={size.width}
          height={size.height}
          style={{ overflow: "visible" }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={(e) => handlePointerMoveGeneric(e, size.width - LEFT_MARGIN)}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {paths.map((p, idx) => (
            <path key={idx} d={p.path} fill="none" stroke={p.color} />
          ))}
          {yTicks.map((p, idx) => {
            const y = yScale(p);
            return (
              <g key={`ytick-${idx}`}>
                <line
                  x1={LEFT_MARGIN}
                  x2={size.width}
                  y1={y}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="2 2"
                />
                <text x={LEFT_MARGIN - 4} y={y + 3} textAnchor="end" fontSize={10} fill="#64748b">
                  {p.toFixed(2)}
                </text>
              </g>
            );
          })}
          {ticks.map((t, idx) => {
            const x = xScale(t.getTime());
            return (
              <g key={`tick-${idx}`}>
                <line x1={x} x2={x} y1={chartHeight} y2={chartHeight + 4} stroke="#94a3b8" />
                <text x={x} y={chartHeight + 14} textAnchor="middle" fontSize={10} fill="#64748b">
                  {formatTick(t)}
                </text>
              </g>
            );
          })}
        </svg>
      </ResponsiveContainer>
    </div>
  );
};

const CandlestickChart = ({
  data,
  width,
  height = 300,
  range,
  indicators,
  trades,
  onRangeChange,
}: CandlestickChartProps) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const resolvedHeight = isMobile ? 200 : height;
  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const defaultRange = React.useMemo(() => {
    if (sorted.length === 0) return { from: 0, to: 0 };
    const endIdx = sorted.length - 1;
    const startIdx = Math.max(0, endIdx - 99);
    return {
      from: sorted[startIdx].date.getTime(),
      to: sorted[endIdx].date.getTime(),
    };
  }, [sorted]);
  const from = range?.from ?? defaultRange.from;
  const to = range?.to ?? defaultRange.to;
  const filtered = sorted.filter((c) => c.date.getTime() >= from && c.date.getTime() <= to);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const onResize = (w: number, h: number) => setSize({ width: w, height: h });
  const dragStart = React.useRef<number | null>(null);
  const dragRange = React.useRef<{ from: number; to: number } | null>(null);
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; candle: Candle } | null>(
    null
  );

  const moveRange = (ratio: number) => {
    if (!onRangeChange) return;
    const widthMs = to - from;
    onRangeChange({ from: from + widthMs * ratio, to: to + widthMs * ratio });
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (!onRangeChange) return;
    e.preventDefault();
    const ratio = (e.deltaY > 0 ? 1 : -1) * 0.1;
    moveRange(ratio);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragStart.current = e.clientX;
    dragRange.current = { from, to };
    setTooltip(null);
  };

  const handlePointerMoveGeneric = (e: React.PointerEvent<SVGSVGElement>, width: number) => {
    if (dragStart.current == null || !dragRange.current || !onRangeChange) return;
    const dx = e.clientX - dragStart.current;
    const ratio = -dx / width;
    const widthMs = dragRange.current.to - dragRange.current.from;
    onRangeChange({
      from: dragRange.current.from + widthMs * ratio,
      to: dragRange.current.to + widthMs * ratio,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    handlePointerMoveGeneric(e, size.width - LEFT_MARGIN);
  };

  const handleBarClick = (c: Candle, x: number, y: number) => {
    setTooltip({ x, y, candle: c });
  };

  const endDrag = () => {
    dragStart.current = null;
    dragRange.current = null;
    setTooltip(null);
  };

  const chartHeight = Math.max(0, size.height - AXIS_HEIGHT);

  const xScale = scaleTime().domain([from, to]).range([LEFT_MARGIN, size.width]);
  const overlayIndicators = indicators?.filter((ind) => ind.pane === undefined || ind.pane === 0);
  const overlayValues =
    overlayIndicators?.flatMap((ind) =>
      ind.data.filter((p) => p.date.getTime() >= from && p.date.getTime() <= to).map((p) => p.value)
    ) ?? [];
  const lows = filtered.map((d) => d.low).concat(overlayValues);
  const highs = filtered.map((d) => d.high).concat(overlayValues);
  const minLow = Math.min(...lows);
  const maxHigh = Math.max(...highs);
  const yScale = scaleLinear().domain([minLow, maxHigh]).range([chartHeight, 0]).nice();
  const candleW =
    filtered.length > 0 ? Math.max(1, (size.width - LEFT_MARGIN) / filtered.length / 1.5) : 1;

  const ticks = xScale.ticks(Math.max(2, Math.floor((size.width - LEFT_MARGIN) / 80)));
  const candleMs = sorted.length > 1 ? sorted[1].date.getTime() - sorted[0].date.getTime() : 0;
  const formatTick = timeFormat(
    candleMs >= 24 * 60 * 60 * 1000
      ? "%Y-%m-%d"
      : candleMs >= 60 * 60 * 1000
        ? "%m/%d %H:%M"
        : "%H:%M:%S"
  );
  const yTicks = yScale.ticks(5);

  const indLines = overlayIndicators?.map((ind) => {
    const filteredData = ind.data.filter((p) => p.date.getTime() >= from && p.date.getTime() <= to);
    return {
      color: ind.color || "#0ea5e9",
      path:
        d3Line<{ date: Date; value: number }>()
          .x((d) => xScale(d.date.getTime()))
          .y((d) => yScale(d.value))(filteredData) ?? "",
    };
  });
  const subIndicators = React.useMemo(
    () => indicators?.filter((ind) => (ind.pane ?? 0) > 0) ?? [],
    [indicators]
  );
  const subPaneMap = React.useMemo(() => {
    const m = new Map<number, Indicator[]>();
    subIndicators.forEach((ind) => {
      const p = ind.pane ?? 1;
      if (!m.has(p)) m.set(p, []);
      m.get(p)!.push(ind);
    });
    return new Map(Array.from(m.entries()).sort((a, b) => a[0] - b[0]));
  }, [subIndicators]);
  const tradeItems = trades?.filter((t) => t.date.getTime() >= from && t.date.getTime() <= to);

  return (
    <div style={{ width: width ? `${width}px` : "100%" }}>
      <div style={{ height: resolvedHeight + AXIS_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%" onResize={onResize}>
          <svg
            width={size.width}
            height={size.height}
            style={{ overflow: "visible" }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            {filtered.map((c, i) => {
              const x = xScale(c.date.getTime());
              const openY = yScale(c.open);
              const closeY = yScale(c.close);
              const highY = yScale(c.high);
              const lowY = yScale(c.low);
              const color = c.close >= c.open ? "#16a34a" : "#ef4444";
              return (
                <g key={i} onClick={() => handleBarClick(c, x, Math.min(openY, closeY))}>
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
            {yTicks.map((p, idx) => {
              const y = yScale(p);
              return (
                <g key={`ytick-${idx}`}>
                  <line
                    x1={LEFT_MARGIN}
                    x2={size.width}
                    y1={y}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="2 2"
                  />
                  <text x={LEFT_MARGIN - 4} y={y + 3} textAnchor="end" fontSize={10} fill="#64748b">
                    {p.toFixed(2)}
                  </text>
                </g>
              );
            })}
            {ticks.map((t, idx) => {
              const x = xScale(t.getTime());
              return (
                <g key={`tick-${idx}`}>
                  <line x1={x} x2={x} y1={chartHeight} y2={chartHeight + 4} stroke="#94a3b8" />
                  <text x={x} y={chartHeight + 14} textAnchor="middle" fontSize={10} fill="#64748b">
                    {formatTick(t)}
                  </text>
                </g>
              );
            })}
            {tooltip && (
              <foreignObject
                x={tooltip.x}
                y={tooltip.y - 45}
                width={100}
                height={40}
                style={{ pointerEvents: "none" }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #94a3b8",
                    fontSize: 10,
                    padding: 2,
                  }}
                >
                  <div>O:{tooltip.candle.open}</div>
                  <div>H:{tooltip.candle.high}</div>
                  <div>L:{tooltip.candle.low}</div>
                  <div>C:{tooltip.candle.close}</div>
                </div>
              </foreignObject>
            )}
          </svg>
        </ResponsiveContainer>
      </div>
      {Array.from(subPaneMap.entries()).map(([pane, inds]) => (
        <SubChart
          key={pane}
          pane={pane}
          indicators={inds}
          range={{ from, to }}
          formatTick={formatTick}
          handlePointerDown={handlePointerDown}
          handlePointerMoveGeneric={handlePointerMoveGeneric}
          handleWheel={handleWheel}
          endDrag={endDrag}
        />
      ))}
    </div>
  );
};

export default CandlestickChart;
