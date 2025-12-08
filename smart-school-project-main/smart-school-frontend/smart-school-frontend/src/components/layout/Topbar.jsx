// src/components/layout/Topbar.jsx
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ toggleSidebarMobile }) {
  const { user, logout } = useAuth();

  return (
    <div className="w-full bg-white shadow-sm px-5 py-3 flex items-center justify-between sticky top-0 z-20">
      {/* 🌐 Mobile Sidebar Toggle */}
      <FiMenu
        className="text-2xl cursor-pointer md:hidden"
        onClick={toggleSidebarMobile}
      />

      {/* USER GREETING */}
      <h1 className="text-lg md:text-xl font-semibold">
        Welcome, {user?.name || "User"}
      </h1>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        <span className="text-gray-600 text-sm hidden sm:block">
          {user?.role?.toUpperCase()}
        </span>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
        >
          <FiLogOut className="text-lg" />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </div>
  );
}
