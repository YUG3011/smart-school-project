import React from "react";
import { useAuth } from "../../context/AuthContext";
import { FiMenu, FiLogOut } from "react-icons/fi";

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-gray-600 md:hidden">
          <FiMenu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome, {user?.name || "User"}
        </h2>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 text-red-600 hover:text-red-800"
      >
        <FiLogOut /> Logout
      </button>
    </header>
  );
}