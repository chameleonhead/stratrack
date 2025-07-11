import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { listDataSources, DataSourceSummary } from "../../api/datasources";
import Button from "../../components/Button";

const DataSources = () => {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState<DataSourceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    listDataSources()
      .then(setDataSources)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">データソース</h2>
        <Button onClick={() => navigate("/data-sources/new")}>＋ 新規作成</Button>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">一覧</h3>
        {isLoading && <p>ロード中...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((ds) => (
            <div key={ds.id} className="rounded-xl border p-4 shadow">
              <h4 className="font-bold">{ds.name}</h4>
              {ds.startTime && ds.endTime && (
                <p className="text-sm text-gray-500">
                  {new Date(ds.startTime).toLocaleDateString()} -{" "}
                  {new Date(ds.endTime).toLocaleDateString()}
                </p>
              )}
              <div className="mt-2 space-x-2">
                <Link to={`/data-sources/${ds.id}/edit`} className="btn btn-sm btn-primary">
                  編集
                </Link>
                <Link to={`/data-sources/${ds.id}/upload`} className="btn btn-sm btn-secondary">
                  アップロード
                </Link>
                <Link to={`/data-sources/${ds.id}/chart`} className="btn btn-sm btn-outline">
                  チャート
                </Link>
              </div>
            </div>
          ))}
          {dataSources.length === 0 && (
            <p className="col-span-full text-center text-gray-500">データソースがありません</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DataSources;
