import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 p-6 overflow-y-auto h-screen">
      <Outlet />
    </main>
  </div>
);

export default Layout;
