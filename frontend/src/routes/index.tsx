import Layout from "../components/SidebarLayout";
import Dashboard from "./dashboard";
import Strategies from "./strategies";
import StrategyDetails from "./strategies/show";
import EditStrategy from "./strategies/edit";
import NewStrategy from "./strategies/new";
import Backtest from "./backtesting";
import DataSources from "./datasources";
import NewDataSource from "./datasources/new";
import EditDataSource from "./datasources/edit";
import UploadDataFile from "./datasources/upload";
import DataSourceChart from "./datasources/chart";
import Settings from "./settings";

export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "strategies", element: <Strategies /> },
      { path: "strategies/:strategyId", element: <StrategyDetails /> },
      { path: "strategies/:strategyId/edit", element: <EditStrategy /> },
      { path: "strategies-new", element: <NewStrategy /> },
      { path: "backtest", element: <Backtest /> },
      { path: "data-sources", element: <DataSources /> },
      { path: "data-sources/new", element: <NewDataSource /> },
      { path: "data-sources/:dataSourceId/edit", element: <EditDataSource /> },
      { path: "data-sources/:dataSourceId/upload", element: <UploadDataFile /> },
      { path: "data-sources/:dataSourceId/chart", element: <DataSourceChart /> },
      { path: "settings", element: <Settings /> },
    ],
  },
];
