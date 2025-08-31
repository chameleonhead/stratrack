import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CandlestickChart, { Indicator } from "../../components/CandlestickChart";
import Select from "../../components/Select";
import { TIMEFRAME_OPTIONS } from "../../timeframes";
import { ChartDataProvider, useChartData } from "../../features/datasources/ChartDataProvider";
import { calculateIndicators } from "../../services/indicatorEngine";

function timeframeToMinutes(tf: string): number {
  const m = tf.match(/^(\d+)([mhd])$/);
  if (!m) return 0;
  const v = Number(m[1]);
  switch (m[2]) {
    case "m":
      return v;
    case "h":
      return v * 60;
    case "d":
      return v * 1440;
    default:
      return 0;
  }
}

const ChartContent = () => {
  const {
    candleData,
    range,
    timeframe,
    setTimeframe,
    isLoading,
    error,
    handleRangeChange,
    symbol,
  } = useChartData();
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  useEffect(() => {
    if (!symbol || candleData.length === 0) {
      setIndicators([]);
      return;
    }
    const tfNum = timeframeToMinutes(timeframe);
    calculateIndicators(symbol, tfNum, [{ name: "iMA", args: [20, 0, 0, 0, 0] }]).then((res) => {
      const values = res["iMA"] ?? [];
      const start = values.length - candleData.length;
      const data = candleData.map((c, i) => ({
        date: c.date,
        value: values[start + i] ?? 0,
      }));
      setIndicators([{ name: "iMA", color: "#0ea5e9", data }]);
    });
  }, [symbol, timeframe, candleData]);
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">チャート表示</h2>
      {isLoading && <p>ロード中...</p>}
      {error && <p className="text-error">{error}</p>}
      <Select
        label="時間足"
        value={timeframe}
        onChange={setTimeframe}
        options={TIMEFRAME_OPTIONS.filter((o) => o.value !== "tick")}
      />
      <CandlestickChart
        data={candleData}
        range={range ?? undefined}
        indicators={indicators}
        onRangeChange={handleRangeChange}
      />
    </div>
  );
};

const DataSourceChart = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  if (!dataSourceId) return null;
  return (
    <ChartDataProvider dataSourceId={dataSourceId}>
      <ChartContent />
    </ChartDataProvider>
  );
};

export default DataSourceChart;
