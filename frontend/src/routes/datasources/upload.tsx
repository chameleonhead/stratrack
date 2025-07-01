import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadDataFile } from "../../api/data";

const UploadDataFile = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataSourceId || !file) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await uploadDataFile(dataSourceId, file);
      navigate("/data-sources");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-bold">チャンクアップロード</h2>
      </header>
      <section>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-error">{error}</p>}
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !file}>
            アップロード
          </button>
        </form>
      </section>
    </div>
  );
};

export default UploadDataFile;
