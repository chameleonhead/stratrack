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
};

const CandlestickChart = ({ data, width = 600, height = 300 }: CandlestickChartProps) => {
  if (data.length === 0) {
    return <svg width={width} height={height}></svg>;
  }

  const minPrice = Math.min(...data.map((d) => d.low));
  const maxPrice = Math.max(...data.map((d) => d.high));

  const candleWidth = width / data.length;
  const scaleY = (price: number) => {
    if (maxPrice === minPrice) return height / 2;
    return height - ((price - minPrice) / (maxPrice - minPrice)) * height;
  };

  return (
    <svg width={width} height={height} className="border rounded">
      {data.map((d, i) => {
        const x = i * candleWidth + candleWidth / 2;
        const openY = scaleY(d.open);
        const closeY = scaleY(d.close);
        const highY = scaleY(d.high);
        const lowY = scaleY(d.low);
        const color = d.close >= d.open ? "#4caf50" : "#f44336";
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
            <rect
              x={x - candleWidth * 0.3}
              y={Math.min(openY, closeY)}
              width={candleWidth * 0.6}
              height={Math.max(1, Math.abs(closeY - openY))}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default CandlestickChart;
