import { FormEvent, useState } from "react";
import Input from "../../components/Input";
import { createDukascopyJob } from "../../api/dukascopyJobs";

const Settings = () => {
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
      setSymbol("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">設定</h2>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">Dukascopy抽出ジョブ</h3>
        <div className="rounded-xl border p-4 shadow max-w-md">
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
              className="mt-2 bg-primary text-primary-content py-1 px-4 rounded"
              disabled={isSubmitting}
            >
              作成
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Settings;
