import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";

const Strategies = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">戦略</h2>
        <Button onClick={() => navigate("/strategies-new")}>＋ 新規戦略作成</Button>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">戦略一覧</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample Card */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border p-4 shadow">
              <h4 className="font-bold">戦略 {i}</h4>
              <p className="text-sm text-gray-600">説明文をここに表示</p>
              <Link
                to={`/strategies/${i}`}
                className="mt-2 bg-primary text-primary-content py-1 px-3 rounded"
              >
                詳細
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Strategies;
