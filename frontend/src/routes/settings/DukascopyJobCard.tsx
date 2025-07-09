import Button from "../../components/Button";
import Input from "../../components/Input";

export type JobState = {
  start: string;
  enabled: boolean;
  processing?: boolean;
  lastStarted?: string;
  lastFinished?: string;
  lastSucceeded?: boolean;
  lastError?: string;
  jobId?: string;
  dataSourceId?: string;
  loaded: boolean;
};

type Props = {
  pair: string;
  job: JobState;
  disabled: boolean;
  onDateChange: (pair: string, value: string) => void;
  onToggle: (pair: string) => void;
};

const DukascopyJobCard = ({ pair, job, disabled, onDateChange, onToggle }: Props) => {
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
        {job.enabled ? "無効化" : "有効化"}
      </Button>
      <p className="text-sm">
        現在のステータス: {job.enabled ? "有効" : "無効"}
        {job.processing ? " (処理中)" : ""}
      </p>
      {job.lastFinished && (
        <p className="text-sm">
          最終実行: {new Date(job.lastFinished).toLocaleString()} -{" "}
          {job.lastSucceeded ? "成功" : `失敗: ${job.lastError ?? ""}`}
        </p>
      )}
    </div>
  );
};

export default DukascopyJobCard;
