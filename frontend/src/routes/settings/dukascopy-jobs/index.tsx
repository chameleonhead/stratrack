import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDukascopyJob } from "../../../api/dukascopyJobs";
import Input from "../../../components/Input";

const DukascopyJobSettings = () => {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState("");
  const [start, setStart] = useState(new Date().toISOString().slice(0, 16));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createDukascopyJob({
        symbol,
        startTime: new Date(start).toISOString(),
      });
      navigate("/settings/dukascopy-jobs");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dukascopyジョブ管理</h2>
      </header>
      <section>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-error">{error}</p>}
          <Input label="通貨ペア" value={symbol} onChange={setSymbol} required fullWidth />
          <Input
            label="開始時刻"
            type="datetime-local"
            value={start}
            onChange={setStart}
            required
            fullWidth
          />
          <button
            type="submit"
            className="mt-4 bg-primary text-primary-content py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            作成
          </button>
        </form>
      </section>
    </div>
  );
};

export default DukascopyJobSettings;
