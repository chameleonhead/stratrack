import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getDataSource } from "../../api/datasources";
import { getDataStream } from "../../api/data";
import { loadCandles, saveCandles, hasCandles } from "../../idb";
import { Candle } from "../../components/CandlestickChart";

export type Range = { from: number; to: number };
export type ChartDataContextValue = {
  candleData: Candle[];
  range: Range | null;
  dsRange: Range | null;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  isLoading: boolean;
  error: string | null;
  handleRangeChange: (range: Range) => Promise<void>;
};

const ChartDataContext = createContext<ChartDataContextValue | null>(null);

export const useChartData = () => {
  const ctx = useContext(ChartDataContext);
  if (!ctx) throw new Error("useChartData must be used within ChartDataProvider");
  return ctx;
};

export const ChartDataProvider = ({
  dataSourceId,
  children,
}: {
  dataSourceId: string;
  children: React.ReactNode;
}) => {
  const [timeframe, setTimeframe] = useState("5m");
  const [range, setRange] = useState<Range | null>(null);
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [loadedRange, setLoadedRange] = useState<Range | null>(null);
  const [dsRange, setDsRange] = useState<Range | null>(null);
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

        const csv = await getDataStream(
          dataSourceId,
          new Date(fromMs).toISOString(),
          new Date(toMs).toISOString(),
          "ohlc",
          timeframe
        );
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

  const handleRangeChange = async (newRange: Range) => {
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
    <ChartDataContext.Provider
      value={{
        candleData,
        range,
        dsRange,
        timeframe,
        setTimeframe,
        isLoading,
        error,
        handleRangeChange,
      }}
    >
      {children}
    </ChartDataContext.Provider>
  );
};
