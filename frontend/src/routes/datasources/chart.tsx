import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDataSource } from "../../api/datasources";
import { getDataStream } from "../../api/data";
import LineChart, { LinePoint } from "../../components/LineChart";
import TimeRangePicker, { TimeRange } from "../../components/TimeRangePicker";
import Button from "../../components/Button";

const DataSourceChart = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const [range, setRange] = useState<TimeRange>({});
  const [dataRange, setDataRange] = useState<TimeRange>({});
  const [data, setData] = useState<LinePoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dataSourceId) return;
    getDataSource(dataSourceId)
      .then((ds) => {
        if (ds.startTime && ds.endTime) {
          setRange({ from: ds.startTime, to: ds.endTime });
          setDataRange({ from: ds.startTime, to: ds.endTime });
        }
      })
      .catch((e) => console.error(e));
  }, [dataSourceId]);
  const handleLoad = async () => {
    if (!dataSourceId || !range.from || !range.to) return;
    try {
      const csv = await getDataStream(dataSourceId, range.from, range.to);
      const lines = csv.split(/\r?\n/).filter((l) => l && !l.startsWith("time"));
      const points: LinePoint[] = lines.map((l) => {
        const [t, bid] = l.split(",");
        return { x: Date.parse(t), y: parseFloat(bid) };
      });
      setData(points);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
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
      <LineChart data={data} />
    </div>
  );
};

export default DataSourceChart;
