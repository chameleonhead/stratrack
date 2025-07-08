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

const CandlestickChart = ({ data, width = 600, height = 300 }: CandlestickChartProps) => {
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
    responsive: false,
    scales: {
      x: { type: "time" },
      y: { beginAtZero: false },
    },
  } as const;

  return (
    <Chart type="candlestick" data={chartData} options={options} width={width} height={height} />
  );
};

export default CandlestickChart;
