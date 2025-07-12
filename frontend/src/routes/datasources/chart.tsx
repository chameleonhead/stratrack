import { useParams } from "react-router-dom";
import CandlestickChart from "../../components/CandlestickChart";
import Select from "../../components/Select";
import { TIMEFRAME_OPTIONS } from "../../timeframes";
import { ChartDataProvider, useChartData } from "../../features/datasources/ChartDataProvider";

const ChartContent = () => {
  const {
    candleData,
    range,
    dsRange,
    timeframe,
    setTimeframe,
    isLoading,
    error,
    handleRangeChange,
  } = useChartData();
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
        limits={dsRange ?? undefined}
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
