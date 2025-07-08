import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";

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

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor((d: Candle) => d.date);
  const { data: chartData, xScale, xAccessor, displayXAccessor } = xScaleProvider(data);

  return (
    <ChartCanvas
      width={width}
      height={height}
      ratio={1}
      data={chartData}
      seriesName="Data"
      xScale={xScale}
      xAccessor={xAccessor}
      displayXAccessor={displayXAccessor}
      margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
    >
      <Chart id={0} yExtents={(d: Candle) => [d.high, d.low]}>
        <XAxis />
        <YAxis />
        <CandlestickSeries />
      </Chart>
    </ChartCanvas>
  );
};

export default CandlestickChart;
