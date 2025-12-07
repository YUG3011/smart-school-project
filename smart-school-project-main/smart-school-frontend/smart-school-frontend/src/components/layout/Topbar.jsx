// src/components/layout/Topbar.jsx
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ toggleSidebarMobile }) {
  const { user, logout } = useAuth();

  return (
    <div className="w-full bg-white shadow-sm p-4 flex items-center justify-between">
      {/* 🌐 Mobile Sidebar Button */}
      <FiMenu
        className="text-2xl cursor-pointer md:hidden"
        onClick={toggleSidebarMobile}
      />

      <h1 className="text-xl font-semibold">Welcome, {user?.name || "User"}</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600 text-sm">{user?.role?.toUpperCase()}</span>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          <FiLogOut />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </div>
  );
}
