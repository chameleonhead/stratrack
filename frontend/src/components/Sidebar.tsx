import { Link } from "react-router-dom";

const menuItems = [
  { label: "ダッシュボード", path: "/" },
  { label: "戦略一覧", path: "/strategies" },
  { label: "新規戦略作成", path: "/strategies/new" },
  { label: "バックテスト", path: "/backtest" },
  { label: "データソース", path: "/data-sources" },
  { label: "設定", path: "/settings" },
];

const Sidebar = () => {
  return (
    <nav className="navbar">
      <ul className="menu min-h-full w-80 p-4">
        {menuItems.map((item) => (
          <li key={item.path} className="hover:bg-gray-700">
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
