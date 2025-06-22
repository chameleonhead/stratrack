import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../../components/Button";
import { listStrategies, StrategySummary } from "../../api/strategies";

const Strategies = () => {
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<StrategySummary[]>([]);

  useEffect(() => {
    listStrategies()
      .then(setStrategies)
      .catch((err) => console.error(err));
  }, []);
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">戦略</h2>
        <Button onClick={() => navigate("/strategies-new")}>＋ 新規戦略作成</Button>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">戦略一覧</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((s) => (
            <div key={s.id} className="rounded-xl border p-4 shadow">
              <h4 className="font-bold">{s.name}</h4>
              <p className="text-sm text-gray-600">最新版: {s.latestVersion}</p>
              <Link
                to={`/strategies/${s.id}`}
                className="mt-2 bg-primary text-primary-content py-1 px-3 rounded"
              >
                詳細
              </Link>
            </div>
          ))}
          {strategies.length === 0 && (
            <p className="col-span-full text-center text-gray-500">戦略がありません</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Strategies;
