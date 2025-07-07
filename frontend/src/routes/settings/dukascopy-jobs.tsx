import { useEffect, useState } from "react";
import DukascopyJobCard, { JobState } from "./DukascopyJobCard";
import { toDateTimeLocalString } from "../../utils";
import {
  createDukascopyJob,
  startDukascopyJob,
  stopDukascopyJob,
  updateDukascopyJob,
  listDukascopyJobs,
  listDukascopyJobLogs,
  DukascopyJobSummary,
  DukascopyJobLog,
} from "../../api/dukascopyJobs";

const PAIRS = ["EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "EURJPY"];

const initialState: Record<string, JobState> = Object.fromEntries(
  PAIRS.map((p) => [
    p,
    {
      start: "",
      running: false,
      dataSourceId: undefined,
      loaded: false,
    },
  ])
);

const DukascopyJobs = () => {
  const [jobs, setJobs] = useState<Record<string, JobState>>(initialState);
  const [logs, setLogs] = useState<Record<string, DukascopyJobLog[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listDukascopyJobs()
      .then((items) => {
        const state = { ...initialState };
        const logState: Record<string, DukascopyJobLog[]> = {};
        return Promise.all(
          items.map(async (j: DukascopyJobSummary) => {
            if (PAIRS.includes(j.symbol)) {
              state[j.symbol] = {
                start: toDateTimeLocalString(j.startTime),
                running: j.isRunning,
                jobId: j.id,
                dataSourceId: j.dataSourceId,
                loaded: true,
              };
              const logs = await listDukascopyJobLogs(j.id).catch(() => []);
              logState[j.symbol] = logs;
            }
          })
        ).then(() => {
          for (const p of PAIRS) {
            state[p] = { ...state[p], loaded: true };
          }
          setJobs(state);
          setLogs(logState);
        });
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  const handleDateChange = (pair: string, value: string) => {
    setJobs((prev) => ({ ...prev, [pair]: { ...prev[pair], start: value } }));
  };

  const handleToggle = async (pair: string) => {
    const job = jobs[pair];
    setIsSubmitting(true);
    setError(null);
    if (!job.start) {
      setError("開始日時を指定してください");
      setIsSubmitting(false);
      return;
    }
    try {
      if (job.running) {
        if (job.jobId) {
          await stopDukascopyJob(job.jobId);
        }
        setJobs((prev) => ({ ...prev, [pair]: { ...job, running: false } }));
      } else {
        let id = job.jobId;
        let dataSourceId = job.dataSourceId;
        if (!id) {
          const res = await createDukascopyJob({
            symbol: pair,
            startTime: new Date(job.start).toISOString(),
          });
          id = res.id;
          dataSourceId = res.dataSourceId;
        } else {
          await updateDukascopyJob(id, {
            dataSourceId: dataSourceId ?? "",
            startTime: new Date(job.start).toISOString(),
          });
        }
        await startDukascopyJob(id);
        setJobs((prev) => ({
          ...prev,
          [pair]: { ...job, running: true, jobId: id, dataSourceId },
        }));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Dukascopyジョブ管理</h2>
        <p className="text-sm text-gray-600 mt-1">
          日付を変更した後は一度ジョブを停止し、再度開始してください
        </p>
      </header>
      {error && <p className="text-error">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PAIRS.map((pair) => (
          <DukascopyJobCard
            key={pair}
            pair={pair}
            job={jobs[pair]}
            logs={logs[pair] ?? []}
            disabled={isSubmitting}
            onDateChange={handleDateChange}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default DukascopyJobs;
