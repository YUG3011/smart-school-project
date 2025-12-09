// src/components/layout/Topbar.jsx

import { FiLogOut, FiMenu } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ toggleSidebarMobile }) {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={toggleSidebarMobile}
        >
          <FiMenu />
        </button>

        {/* USER GREETING */}
        <h1 className="text-lg md:text-xl font-semibold text-gray-700">
          Welcome, {user?.name || "User"}
        </h1>

        {/* ROLE + LOGOUT */}
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">
            {user?.role?.toUpperCase()}
          </span>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition"
          >
            <FiLogOut />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
