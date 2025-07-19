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
};

const LineChart = ({ width, height = 300, data, range }: LineChartProps) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const resolvedHeight = isMobile ? 200 : height;
  const filtered = range ? data.filter((p) => p.x >= range.from && p.x <= range.to) : data;
  return (
    <div style={{ width: width ? `${width}px` : "100%", height: resolvedHeight }}>
      <ResponsiveContainer width="100%" height="100%">
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
