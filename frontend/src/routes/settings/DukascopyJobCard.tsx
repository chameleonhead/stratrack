import Button from "../../components/Button";
import Input from "../../components/Input";

export type JobState = {
  start: string;
  enabled: boolean;
  running?: boolean;
  interruptRequested?: boolean;
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
  onRun: (pair: string) => void;
  onInterrupt: (pair: string) => void;
  onDeleteData: (pair: string) => void;
};

const DukascopyJobCard = ({
  pair,
  job,
  disabled,
  onDateChange,
  onToggle,
  onRun,
  onInterrupt,
  onDeleteData,
}: Props) => {
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
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onToggle(pair)} disabled={disabled} isLoading={disabled}>
          {job.enabled ? "無効化" : "有効化"}
        </Button>
        {job.enabled && !job.running && (
          <Button size="sm" onClick={() => onRun(pair)} disabled={disabled} isLoading={disabled}>
            実行
          </Button>
        )}
        {job.running && (
          <Button
            size="sm"
            onClick={() => onInterrupt(pair)}
            disabled={disabled}
            isLoading={disabled}
          >
            中断
          </Button>
        )}
        {job.dataSourceId && (
          <Button
            size="sm"
            onClick={() => onDeleteData(pair)}
            disabled={disabled}
            isLoading={disabled}
          >
            データ削除
          </Button>
        )}
      </div>
      <p className="text-sm">
        現在のステータス: {job.enabled ? "有効" : "無効"}
        {job.running ? (job.interruptRequested ? " (中断待ち)" : " (処理中)") : ""}
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
