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
  const [loadedRange, setLoadedRange] = useState<{ from: number; to: number } | null>(null);
  const [dsRange, setDsRange] = useState<{ from: number; to: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(
    async (fromMs: number, toMs: number): Promise<Candle[]> => {
      if (!dataSourceId) return [];
      setIsLoading(true);
      try {
        const cached = await loadCandles(dataSourceId, timeframe, fromMs, toMs);
        const complete = await hasCandles(dataSourceId, timeframe, fromMs, toMs);
        if (complete) {
          setError(null);
          setIsLoading(false);
          return cached.map((c) => ({
            date: new Date(c.time),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }));
        }

        const from = new Date(fromMs).toISOString();
        const to = new Date(toMs).toISOString();
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
        return candles;
      } catch (e) {
        setError((e as Error).message);
        return [];
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
          setDsRange({ from: start, to: end });
          const defaultFrom = Math.max(start, end - 24 * 60 * 60 * 1000);
          const initRange = { from: defaultFrom, to: end };
          setRange(initRange);
          const data = await loadData(defaultFrom, end);
          setCandleData(data);
          setLoadedRange(initRange);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [dataSourceId, loadData, timeframe]);

  useEffect(() => {
    setLoadedRange(null);
    setCandleData([]);
  }, [dataSourceId, timeframe]);
  const handleRangeChange = async (newRange: { from: number; to: number }) => {
    setRange(newRange);
    if (!loadedRange) {
      const data = await loadData(newRange.from, newRange.to);
      setCandleData(data);
      setLoadedRange({ ...newRange });
      return;
    }

    const width = newRange.to - newRange.from;
    const margin = width * 0.2;
    let from = loadedRange.from;
    let to = loadedRange.to;
    if (newRange.from - margin <= loadedRange.from) {
      from = Math.max(dsRange?.from ?? newRange.from, loadedRange.from - width);
    }
    if (newRange.to + margin >= loadedRange.to) {
      to = Math.min(dsRange?.to ?? newRange.to, loadedRange.to + width);
    }

    if (from !== loadedRange.from || to !== loadedRange.to) {
      const data = await loadData(from, to);
      setCandleData(data);
      setLoadedRange({ from, to });
    }
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
