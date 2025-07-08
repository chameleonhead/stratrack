import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DataSourceDetail, getDataSource } from "../../api/datasources";
import { getDataStream } from "../../api/data";
import LineChart, { LinePoint } from "../../components/LineChart";
import CandlestickChart, { Candle } from "../../components/CandlestickChart";
import TimeRangePicker, { TimeRange } from "../../components/TimeRangePicker";
import Button from "../../components/Button";

const DataSourceChart = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const [range, setRange] = useState<TimeRange>({});
  const [dataRange, setDataRange] = useState<TimeRange>({});
  const [lineData, setLineData] = useState<LinePoint[]>([]);
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (from: string, to: string) => {
      if (!dataSourceId) return;
      try {
        const csv = await getDataStream(dataSourceId, from, to);
        const lines = csv.split(/\r?\n/).filter((l) => l && !l.startsWith("time"));
        if (dataSource?.format === "ohlc") {
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
        } else {
          const points: LinePoint[] = lines.map((l) => {
            const [t, bid] = l.split(",");
            return { x: Date.parse(t), y: parseFloat(bid) };
          });
          setLineData(points);
        }
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [dataSourceId, dataSource]
  );

  useEffect(() => {
    if (!dataSourceId) return;
    getDataSource(dataSourceId)
      .then(async (ds) => {
        setDataSource(ds);
        if (ds.startTime && ds.endTime) {
          const end = new Date(ds.endTime).getTime();
          const start = ds.startTime ? new Date(ds.startTime).getTime() : end;
          const defaultFrom = new Date(Math.max(start, end - 24 * 60 * 60 * 1000)).toISOString();
          setRange({ from: defaultFrom, to: ds.endTime });
          setDataRange({ from: ds.startTime, to: ds.endTime });
          await loadData(defaultFrom, ds.endTime);
        }
      })
      .catch((e) => console.error(e));
  }, [dataSourceId, loadData]);
  const handleLoad = async () => {
    if (!range.from || !range.to) return;
    await loadData(range.from, range.to);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">チャート表示</h2>
      <div className="space-y-2">
        <TimeRangePicker label="期間" value={range} onChange={setRange} fullWidth />
        {dataRange.from && dataRange.to && (
          <p className="text-sm text-gray-500">
            利用可能期間: {new Date(dataRange.from).toLocaleString()} -{" "}
            {new Date(dataRange.to).toLocaleString()}
          </p>
        )}
        <Button onClick={handleLoad}>表示</Button>
        {error && <p className="text-error">{error}</p>}
      </div>
      {dataSource?.format === "ohlc" ? (
        <CandlestickChart data={candleData} />
      ) : (
        <LineChart data={lineData} />
      )}
    </div>
  );
};

export default DataSourceChart;
