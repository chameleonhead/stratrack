import { useEffect, useState } from "react";
import Input from "../../components/Input";
import {
  createDukascopyJob,
  startDukascopyJob,
  stopDukascopyJob,
  listDukascopyJobs,
  DukascopyJobSummary,
} from "../../api/dukascopyJobs";

const PAIRS = ["EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "EURJPY"];

type JobState = { start: string; running: boolean; jobId?: string };

const initialState: Record<string, JobState> = Object.fromEntries(
  PAIRS.map((p) => [p, { start: new Date().toISOString().slice(0, 16), running: false }])
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
              start: j.startTime.slice(0, 16),
              running: j.isRunning,
              jobId: j.id,
            };
          }
        });
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
      <table className="table w-full">
        <thead>
          <tr>
            <th>通貨ペア</th>
            <th>開始日時</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map((pair) => {
            const job = jobs[pair];
            return (
              <tr key={pair} className="hover">
                <td>{pair}</td>
                <td>
                  <Input
                    type="datetime-local"
                    value={job.start}
                    onChange={(v) => handleDateChange(pair, v)}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleToggle(pair)}
                    disabled={isSubmitting}
                  >
                    {job.running ? "停止" : "開始"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DukascopyJobs;
