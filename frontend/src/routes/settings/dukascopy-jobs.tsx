import { useEffect, useState } from "react";
import DukascopyJobCard, { JobState } from "./DukascopyJobCard";
import { toDateTimeLocalString } from "../../utils";
import {
  createDukascopyJob,
  enableDukascopyJob,
  disableDukascopyJob,
  startDukascopyJobExecution,
  updateDukascopyJob,
  listDukascopyJobs,
  DukascopyJobSummary,
} from "../../api/dukascopyJobs";

const PAIRS = ["EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "EURJPY"];

const initialState: Record<string, JobState> = Object.fromEntries(
  PAIRS.map((p) => [
    p,
    {
      start: "",
      enabled: false,
      processing: false,
      jobId: undefined,
      dataSourceId: undefined,
      lastStarted: undefined,
      lastFinished: undefined,
      lastSucceeded: undefined,
      lastError: undefined,
      loaded: false,
    },
  ])
);

const DukascopyJobs = () => {
  const [jobs, setJobs] = useState<Record<string, JobState>>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listDukascopyJobs()
      .then((items) => {
        const state = { ...initialState };
        items.forEach((j: DukascopyJobSummary) => {
          if (PAIRS.includes(j.symbol)) {
            state[j.symbol] = {
              start: toDateTimeLocalString(j.startTime),
              enabled: j.isEnabled,
              processing: j.isProcessing,
              lastStarted: j.lastProcessStartedAt,
              lastFinished: j.lastProcessFinishedAt,
              lastSucceeded: j.lastProcessSucceeded,
              lastError: j.lastProcessError,
              jobId: j.id,
              dataSourceId: j.dataSourceId,
              loaded: true,
            };
          }
        });
        for (const p of PAIRS) {
          state[p] = { ...state[p], loaded: true };
        }
        setJobs(state);
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
      if (job.enabled) {
        if (job.jobId) {
          await disableDukascopyJob(job.jobId);
        }
        setJobs((prev) => ({ ...prev, [pair]: { ...job, enabled: false } }));
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
        await enableDukascopyJob(id);
        await startDukascopyJobExecution(id);
        setJobs((prev) => ({
          ...prev,
          [pair]: { ...job, enabled: true, jobId: id, dataSourceId },
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
          日付を変更した後は一度ジョブを無効化し、再度有効化してください
        </p>
      </header>
      {error && <p className="text-error">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PAIRS.map((pair) => (
          <DukascopyJobCard
            key={pair}
            pair={pair}
            job={jobs[pair]}
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
