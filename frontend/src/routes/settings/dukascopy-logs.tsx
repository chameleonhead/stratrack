import { useEffect, useState } from "react";
import { listAllDukascopyJobLogs, DukascopyJobLog } from "../../api/dukascopyJobs";
import Button from "../../components/Button";

const PAGE_SIZE = 50;

const DukascopyLogs = () => {
  const [logs, setLogs] = useState<DukascopyJobLog[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    listAllDukascopyJobLogs(page, PAGE_SIZE)
      .then(setLogs)
      .catch((err) => console.error(err));
  }, [page]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dukascopyログ</h2>
      </header>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>実行時刻</th>
            <th>通貨</th>
            <th>対象時刻</th>
            <th>結果</th>
            <th>エラー</th>
            <th>時間(ms)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.executedAt + l.symbol}>
              <td>{new Date(l.executedAt).toLocaleString()}</td>
              <td>{l.symbol}</td>
              <td>{new Date(l.targetTime).toLocaleString()}</td>
              <td>{l.isSuccess ? "成功" : "失敗"}</td>
              <td>{l.errorMessage ?? ""}</td>
              <td>{Math.round(l.duration)}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">
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
