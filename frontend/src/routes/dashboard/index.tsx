import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Tab from "../../components/Tab";

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ダッシュボード</h2>
        <Button onClick={() => navigate("/strategies/new")}>＋ 新規戦略作成</Button>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">最近使った戦略</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* サンプルカード */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border p-4 shadow">
              <h4 className="font-bold">戦略 {i}</h4>
              <p className="text-sm text-gray-600">説明文をここに表示</p>
              <Button size="sm" onClick={() => (location.href = `/strategies/${i}`)}>
                開く
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">バックテスト結果</h3>
        <Tab
          tabs={[
            {
              label: "今週",
            },
            {
              label: "今月",
            },
            {
              label: "すべて",
            },
          ].map((tab) => ({
            id: tab.label,
            label: tab.label,
            content: <p>ここにグラフや結果の概要を表示</p>,
            error: false,
            disabled: false,
          }))}
          selectedIndex={0}
        />
      </section>
    </div>
  );
};

export default Dashboard;
