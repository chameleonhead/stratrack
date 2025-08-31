import { useParams } from "react-router-dom";
import CandlestickChart from "../../components/CandlestickChart";
import Select from "../../components/Select";
import IndicatorWizard from "../../components/IndicatorWizard";
import { TIMEFRAME_OPTIONS } from "../../timeframes";
import ChartDataProvider from "../../features/datasources/ChartDataProvider";
import { useChartData } from "../../features/datasources/useChartData";
import { useIndicatorList } from "../../features/indicators/IndicatorProvider";
import type { Indicator } from "../../codegen/dsl/indicator";

const ChartContent = () => {
  const {
    candleData,
    range,
    timeframe,
    setTimeframe,
    isLoading,
    error,
    handleRangeChange,
    indicators,
    setIndicatorDefs,
  } = useChartData();
  const indicatorList = useIndicatorList().filter((i) => i.name === "moving_average");

  const handleIndicatorSubmit = (ind: Indicator, params: Record<string, unknown>, pane = 0) => {
    if (ind.name !== "moving_average") return;
    const method = params.method as string;
    const source = params.source as string;
    const period = Number(params.period ?? 14);
    const maMethodMap: Record<string, number> = { sma: 0, ema: 1, smma: 2, lwma: 3 };
    const appliedMap: Record<string, number> = {
      close: 0,
      open: 1,
      high: 2,
      low: 3,
      median: 4,
      typical: 5,
      weighted: 6,
    };
    const maMethod = maMethodMap[method] ?? 0;
    const applied = appliedMap[source] ?? 0;
    setIndicatorDefs((prev) => [
      ...prev,
      { name: "iMA", args: [period, 0, maMethod, applied, 0], pane },
    ]);
  };
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
      <IndicatorWizard
        indicators={indicatorList}
        onSubmit={handleIndicatorSubmit}
        enablePaneSelection
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
