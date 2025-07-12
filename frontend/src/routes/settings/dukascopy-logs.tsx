import { useEffect, useState } from "react";
import { listAllDukascopyJobLogs, DukascopyJobLog } from "../../api/dukascopyJobs";
import Button from "../../components/Button";

const PAGE_SIZE = 50;

const DukascopyLogs = () => {
  const [logs, setLogs] = useState<DukascopyJobLog[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    listAllDukascopyJobLogs(page, PAGE_SIZE)
      .then(setLogs)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dukascopyログ</h2>
      </header>
      {isLoading && <p>ロード中...</p>}
      <table className="table table-sm">
        <thead>
          <tr>
            <th>URL</th>
            <th>HTTPステータス</th>
            <th>ETag</th>
            <th>最終更新日</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.fileUrl}>
              <td className="break-all">{l.fileUrl}</td>
              <td>{l.httpStatus}</td>
              <td>{l.eTag ?? ""}</td>
              <td>{l.lastModified ? new Date(l.lastModified).toLocaleString() : ""}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center">
                ログがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-between">
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          前へ
        </Button>
        <span>Page {page}</span>
        <Button onClick={() => setPage((p) => p + 1)}>次へ</Button>
      </div>
    </div>
  );
};

export default DukascopyLogs;
