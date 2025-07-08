import Button from "../../components/Button";
import Input from "../../components/Input";
import type { DukascopyJobLog } from "../../api/dukascopyJobs";

export type JobState = {
  start: string;
  running: boolean;
  jobId?: string;
  dataSourceId?: string;
  loaded: boolean;
};

type Props = {
  pair: string;
  job: JobState;
  logs: DukascopyJobLog[];
  disabled: boolean;
  onDateChange: (pair: string, value: string) => void;
  onToggle: (pair: string) => void;
};

const DukascopyJobCard = ({ pair, job, logs, disabled, onDateChange, onToggle }: Props) => {
  const isLoading = !job.loaded;
  return (
    <div className="rounded-xl border p-4 shadow space-y-2">
      <h4 className="font-bold text-lg">{pair}</h4>
      <Input
        type="datetime-local"
        value={job.start}
        placeholder={isLoading ? "ロード中..." : undefined}
        onChange={(v) => onDateChange(pair, v)}
        fullWidth
        disabled={isLoading}
      />
      <Button size="sm" onClick={() => onToggle(pair)} disabled={disabled}>
        {job.running ? "停止" : "開始"}
      </Button>
      <details className="text-sm">
        <summary className="cursor-pointer">履歴</summary>
        <ul className="mt-1 pl-4 list-disc space-y-1 max-h-40 overflow-y-auto">
          {logs.map((l) => (
            <li key={l.executedAt}>
              {new Date(l.executedAt).toLocaleString()} - {new Date(l.targetTime).toLocaleString()}{" "}
              -{l.isSuccess ? "成功" : `失敗: ${l.errorMessage ?? ""}`} ({Math.round(l.duration)}ms)
            </li>
          ))}
          {logs.length === 0 && <li>なし</li>}
        </ul>
      </details>
    </div>
  );
};

export default DukascopyJobCard;
