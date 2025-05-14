import Layout from "../components/SidebarLayout";
import Dashboard from "./dashboard";
import Strategies from "./strategies";
import NewStrategy from "./strategies/new";
import Backtest from "./backtesting";
import DataSources from "./datasources";
import Settings from "./settings";

export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "strategies", element: <Strategies /> },
      { path: "strategies/new", element: <NewStrategy /> },
      { path: "backtest", element: <Backtest /> },
      { path: "data-sources", element: <DataSources /> },
      { path: "settings", element: <Settings /> },
    ],
  },
];
