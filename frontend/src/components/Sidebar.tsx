import { useNavigate } from "react-router-dom";
import Button from "./Button";

const menuItems = [
  { label: "ダッシュボード", path: "/" },
  { label: "戦略一覧", path: "/strategies" },
  { label: "新規戦略作成", path: "/strategies/new" },
  { label: "バックテスト", path: "/backtest" },
  { label: "データソース", path: "/data-sources" },
  { label: "設定", path: "/settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4">
      <h1 className="text-xl font-bold mb-6">Stratrack</h1>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.path} className="flex items-center">
            <Button onClick={() => navigate(item.path)} fullWidth>
              {item.label}
            </Button>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
