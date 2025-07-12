import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  TimeScale,
  PointElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

export type LinePoint = { x: number; y: number };

export type LineChartProps = {
  width?: number;
  height?: number;
  data: LinePoint[];
  range?: { from: number; to: number };
  onRangeChange?: (range: { from: number; to: number }) => void;
};

ChartJS.register(LineElement, LinearScale, TimeScale, PointElement, Tooltip, Legend);
ChartJS.register(zoomPlugin);

const LineChart = ({ width, height = 300, data, range, onRangeChange }: LineChartProps) => {
  const chartData: ChartData<"line", { x: number; y: number }[]> = {
    datasets: [
      {
        label: "value",
        data,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.4)",
        pointRadius: 0,
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
    <div style={{ width: width ? `${width}px` : "100%", height }}>
      <Line className="w-full h-full" data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
