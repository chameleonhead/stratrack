import { useEffect, useState } from "react";
import DukascopyJobCard, { JobState } from "./DukascopyJobCard";
import {
  createDukascopyJob,
  startDukascopyJob,
  stopDukascopyJob,
  listDukascopyJobs,
  listDukascopyJobLogs,
  DukascopyJobSummary,
  DukascopyJobLog,
} from "../../api/dukascopyJobs";

const PAIRS = ["EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "EURJPY"];

const initialState: Record<string, JobState> = Object.fromEntries(
  PAIRS.map((p) => [p, { start: new Date().toISOString().slice(0, 16), running: false }])
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
                start: j.startTime.slice(0, 16),
                running: j.isRunning,
                jobId: j.id,
              };
              const logs = await listDukascopyJobLogs(j.id).catch(() => []);
              logState[j.symbol] = logs;
            }
          })
        ).then(() => {
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
    try {
      if (job.running) {
        if (job.jobId) {
          await stopDukascopyJob(job.jobId);
        }
        setJobs((prev) => ({ ...prev, [pair]: { ...job, running: false } }));
      } else {
        let id = job.jobId;
        if (!id) {
          const res = await createDukascopyJob({
            symbol: pair,
            startTime: new Date(job.start).toISOString(),
          });
          id = res.id;
        }
        await startDukascopyJob(id);
        setJobs((prev) => ({ ...prev, [pair]: { ...job, running: true, jobId: id } }));
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
