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
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

export type LinePoint = { x: number; y: number };

export type LineChartProps = {
  width?: number;
  height?: number;
  data: LinePoint[];
};

ChartJS.register(LineElement, LinearScale, TimeScale, PointElement, Tooltip, Legend);

const LineChart = ({ width = 600, height = 300, data }: LineChartProps) => {
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
    responsive: false,
    scales: {
      x: { type: "time" },
      y: { beginAtZero: false },
    },
  } as const;

  return <Line data={chartData} options={options} width={width} height={height} />;
};

export default LineChart;
