import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getDataSource } from "../../api/datasources";
import { getDataStream } from "../../api/data";
import CandlestickChart, { Candle } from "../../components/CandlestickChart";
import Select from "../../components/Select";
import { TIMEFRAME_OPTIONS } from "../../timeframes";
import { loadCandles, saveCandles, hasCandles } from "../../idb";

const DataSourceChart = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const [timeframe, setTimeframe] = useState("5m");
  const [range, setRange] = useState<{ from: number; to: number } | null>(null);
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(
    async (from: string, to: string) => {
      if (!dataSourceId) return;
      setIsLoading(true);
      try {
        const fromMs = Date.parse(from);
        const toMs = Date.parse(to);
        const cached = await loadCandles(dataSourceId, timeframe, fromMs, toMs);
        const complete = await hasCandles(dataSourceId, timeframe, fromMs, toMs);
        if (complete) {
          setCandleData(
            cached.map((c) => ({
              date: new Date(c.time),
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
            }))
          );
          setError(null);
          setIsLoading(false);
          return;
        }

        const csv = await getDataStream(dataSourceId, from, to, "ohlc", timeframe);
        const lines = csv
          .split(/\r?\n/)
          .map((l) => l.replace(/^data:\s*/, ""))
          .filter((l) => l && !l.startsWith("time"));
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
        await saveCandles(
          dataSourceId,
          timeframe,
          candles.map((c) => ({
            dataSourceId,
            timeframe,
            time: c.date.getTime(),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
        );
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [dataSourceId, timeframe]
  );

  useEffect(() => {
    if (!dataSourceId) return;
    setIsLoading(true);
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
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [dataSourceId, loadData, timeframe]);
  const handleRangeChange = async (newRange: { from: number; to: number }) => {
    setRange(newRange);
    await loadData(new Date(newRange.from).toISOString(), new Date(newRange.to).toISOString());
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
      <CandlestickChart
        data={candleData}
        range={range ?? undefined}
        onRangeChange={handleRangeChange}
      />
    </div>
  );
};

export default DataSourceChart;
