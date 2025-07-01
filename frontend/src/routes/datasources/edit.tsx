import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDataSource,
  updateDataSource,
  deleteDataSource,
  DataSourceDetail,
} from "../../api/datasources";
import DataSourceForm, { DataSourceFormValue } from "../../features/datasources/DataSourceForm";

const EditDataSource = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const [dataSource, setDataSource] = useState<DataSourceDetail | null>(null);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dataSourceId) {
      getDataSource(dataSourceId)
        .then(setDataSource)
        .catch((err) => console.error(err));
    }
  }, [dataSourceId]);

  if (!dataSource) {
    return <p className="p-6">Loading...</p>;
  }

  const handleFormChange = (value: DataSourceFormValue) => {
    setDataSource((prev) => (prev ? { ...prev, ...value } : prev));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataSourceId || !dataSource.name) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await updateDataSource(dataSourceId, {
        name: dataSource.name,
        description: dataSource.description,
      });
      navigate("/data-sources");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!dataSourceId) {
      return;
    }
    if (!confirm("本当に削除しますか？")) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteDataSource(dataSourceId);
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
        <h2 className="text-2xl font-bold">データソース編集</h2>
        <button
          type="button"
          className="btn btn-error"
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          削除
        </button>
      </header>
      <section>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-error">{error}</p>}
          <DataSourceForm value={dataSource} onChange={handleFormChange} hideSourceFields />
          <button
            type="submit"
            className="mt-4 bg-primary text-primary-content py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            更新
          </button>
        </form>
      </section>
    </div>
  );
};

export default EditDataSource;
