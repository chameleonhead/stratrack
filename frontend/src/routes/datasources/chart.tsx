import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getDataSource } from "../../api/datasources";
import { getDataStream } from "../../api/data";
import CandlestickChart, { Candle } from "../../components/CandlestickChart";

const DataSourceChart = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const [range, setRange] = useState<{ from: number; to: number } | null>(null);
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (from: string, to: string) => {
      if (!dataSourceId) return;
      try {
        const csv = await getDataStream(dataSourceId, from, to, "ohlc", "5m");
        const lines = csv.split(/\r?\n/).filter((l) => l && !l.startsWith("time"));
        const candles: Candle[] = lines.map((l) => {
          const [t, o, h, low, c] = l.split(",");
          return {
            date: new Date(t),
            open: parseFloat(o),
            high: parseFloat(h),
            low: parseFloat(low),
            close: parseFloat(c),
          };
        });
        setCandleData(candles);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [dataSourceId]
  );

  useEffect(() => {
    if (!dataSourceId) return;
    getDataSource(dataSourceId)
      .then(async (ds) => {
        if (ds.startTime && ds.endTime) {
          const end = new Date(ds.endTime).getTime();
          const start = ds.startTime ? new Date(ds.startTime).getTime() : end;
          const defaultFrom = Math.max(start, end - 24 * 60 * 60 * 1000);
          setRange({ from: defaultFrom, to: end });
          await loadData(new Date(defaultFrom).toISOString(), ds.endTime);
        }
      })
      .catch((e) => console.error(e));
  }, [dataSourceId, loadData]);
  const handleRangeChange = async (newRange: { from: number; to: number }) => {
    setRange(newRange);
    await loadData(new Date(newRange.from).toISOString(), new Date(newRange.to).toISOString());
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">チャート表示</h2>
      {error && <p className="text-error">{error}</p>}
      <CandlestickChart
        data={candleData}
        range={range ?? undefined}
        onRangeChange={handleRangeChange}
      />
    </div>
  );
};

export default DataSourceChart;
