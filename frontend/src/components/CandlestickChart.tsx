import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  CategoryScale,
  BarController,
  BarElement,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import "chartjs-adapter-date-fns";
import { Chart } from "react-chartjs-2";

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
  onRangeChange?: (range: { from: number; to: number }) => void;
};

ChartJS.register(
  CandlestickController,
  CandlestickElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  CategoryScale,
  BarController,
  BarElement
);
ChartJS.register(zoomPlugin);

const CandlestickChart = ({
  data,
  width,
  height = 300,
  range,
  onRangeChange,
}: CandlestickChartProps) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const resolvedHeight = isMobile ? 200 : height;
  const chartData = {
    datasets: [
      {
        label: "price",
        data: data.map((d) => ({
          x: d.date.getTime(),
          o: d.open,
          h: d.high,
          l: d.low,
          c: d.close,
        })),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: "time", min: range?.from, max: range?.to },
      y: { beginAtZero: false },
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
        },
        pan: { enabled: true, mode: "x" },
        onZoomComplete: ({ chart }: { chart: ChartJS }) => {
          const from = chart.scales.x.min as number;
          const to = chart.scales.x.max as number;
          onRangeChange?.({ from, to });
        },
        onPanComplete: ({ chart }: { chart: ChartJS }) => {
          const from = chart.scales.x.min as number;
          const to = chart.scales.x.max as number;
          onRangeChange?.({ from, to });
        },
      },
    },
  } as const;

  return (
    <div style={{ width: width ? `${width}px` : "100%", height: resolvedHeight }}>
      <Chart className="w-full h-full" type="candlestick" data={chartData} options={options} />
    </div>
  );
};

export default CandlestickChart;
