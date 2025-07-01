import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDataSource, NewDataSourceRequest } from "../../api/datasources";
import DataSourceForm from "../../features/datasources/DataSourceForm";

const NewDataSource = () => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<Partial<NewDataSourceRequest>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataSource.name || !dataSource.symbol || !dataSource.timeframe || !dataSource.sourceType) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createDataSource(dataSource as NewDataSourceRequest);
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
          <DataSourceForm value={dataSource} onChange={setDataSource} />
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
