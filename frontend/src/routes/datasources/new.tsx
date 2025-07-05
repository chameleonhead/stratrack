import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDataSource } from "../../api/datasources";
import DataSourceForm, {
  DataSourceFormHandle,
  DataSourceFormValue,
} from "../../features/datasources/DataSourceForm";

const NewDataSource = () => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<DataSourceFormValue>({
    timeframe: "1m",
    format: "tick",
    volume: "none",
  });
  const formRef = useRef<DataSourceFormHandle>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const validHtml = form.reportValidity();
    const validForm = formRef.current?.validate() ?? true;
    if (!validHtml || !validForm) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createDataSource({
        name: dataSource.name!,
        symbol: dataSource.symbol!,
        timeframe: dataSource.timeframe!,
        format: dataSource.format!,
        volume: dataSource.volume,
        description: dataSource.description,
      });
      navigate("/data-sources");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">データソース新規作成</h2>
      </header>
      <section>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-error">{error}</p>}
          <DataSourceForm ref={formRef} value={dataSource} onChange={setDataSource} />
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

export default NewDataSource;
