import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => (
  <div>
    <div className="lg:hidden navbar w-full bg-gray-800 text-white h-16">
      <div className="flex-none lg:hidden">
        <label
          htmlFor="drawer-checkbox"
          aria-label="open sidebar"
          className="btn btn-square btn-ghost"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-6 w-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
      </div>
      <h1 className="ml-2 text-xl font-bold">Stratrack</h1>
    </div>
    <div className="drawer lg:drawer-open">
      <input id="drawer-checkbox" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <Outlet />
      </div>
      <div className="drawer-side">
        <label htmlFor="drawer-checkbox" aria-label="close sidebar" className="drawer-overlay" />
        <aside className="w-64 bg-gray-800 text-white h-screen">
          <div className="navbar bg-gray-800 text-white h-16">
            <h1 className="ml-4 text-xl font-bold">Stratrack</h1>
          </div>
          <Sidebar />
        </aside>
      </div>
    </div>
  </div>
);

export default Layout;
