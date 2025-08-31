import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getDataSource } from "../../api/datasources";
import { getDataHistory } from "../../api/data";
import { loadCandles, saveCandles, hasCandles } from "../../idb";
import { Candle, Indicator } from "../../components/CandlestickChart";
import { calculateIndicators, subscribeIndicatorSource } from "../../services/indicatorEngine";

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
  symbol: string;
  indicators: Indicator[];
  setIndicators: React.Dispatch<React.SetStateAction<Indicator[]>>;
};

const ChartDataContext = createContext<ChartDataContextValue | null>(null);

export const useChartData = () => {
  const ctx = useContext(ChartDataContext);
  if (!ctx) throw new Error("useChartData must be used within ChartDataProvider");
  return ctx;
};

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
  const [symbol, setSymbol] = useState("");
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [sourceVersion, setSourceVersion] = useState(0);

  useEffect(() => {
    return subscribeIndicatorSource(() => setSourceVersion((v) => v + 1));
  }, []);

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

        const { data } = await getDataHistory(
          dataSourceId,
          timeframe,
          new Date(toMs).toISOString()
        );
        const candles: Candle[] = data.map((d) => ({
          date: new Date(d.time),
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));
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
        const filtered = candles.filter(
          (c) => c.date.getTime() >= fromMs && c.date.getTime() <= toMs
        );
        return filtered;
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
        setSymbol(ds.symbol);
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
  }, [symbol, timeframe, candleData, sourceVersion]);

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
        symbol,
        indicators,
        setIndicators,
      }}
    >
      {children}
    </ChartDataContext.Provider>
  );
};
