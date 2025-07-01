export type LinePoint = { x: number; y: number };

export type LineChartProps = {
  width?: number;
  height?: number;
  data: LinePoint[];
};

const LineChart = ({ width = 600, height = 300, data }: LineChartProps) => {
  if (data.length === 0) {
    return <svg width={width} height={height}></svg>;
  }

  const minX = Math.min(...data.map((d) => d.x));
  const maxX = Math.max(...data.map((d) => d.x));
  const minY = Math.min(...data.map((d) => d.y));
  const maxY = Math.max(...data.map((d) => d.y));

  const points = data
    .map((d) => {
      const x = ((d.x - minX) / (maxX - minX)) * width;
      const y = height - ((d.y - minY) / (maxY - minY)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="border rounded">
      <polyline fill="none" stroke="currentColor" strokeWidth="1" points={points} />
    </svg>
  );
};

export default LineChart;
