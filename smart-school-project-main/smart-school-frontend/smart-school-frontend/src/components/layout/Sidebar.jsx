// src/components/layout/Sidebar.jsx

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiBookOpen,
  FiCamera,
  FiClipboard,
  FiPieChart,
  FiMessageCircle,
} from "react-icons/fi";

export default function Sidebar({ isOpen, adminMenu, teacherMenu, studentMenu, parentMenu }) {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const location = useLocation();

  // Detect menu
  const menu =
    role === "admin"
      ? adminMenu
      : role === "teacher"
      ? teacherMenu
      : role === "student"
      ? studentMenu
      : role === "parent"
      ? parentMenu
      : [];

  return (
    <aside
      className={`bg-white shadow-md transition-all duration-300 h-screen 
      ${!isOpen ? "w-20" : "w-64"} hidden md:flex flex-col`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        {isOpen && (
          <h2 className="text-xl font-semibold text-gray-800">Smart School</h2>
        )}
        {/* The toggle button is in Navbar now */}
      </div>

      {/* MENU */}
      <nav className="flex flex-col mt-4 px-2">
        {menu.map((item, idx) =>
          item.section ? (
            <div
              key={idx}
              className={`px-3 text-sm text-gray-500 uppercase mt-4 mb-2 ${
                !isOpen ? "hidden" : "block"
              }`}
            >
              {item.section}
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 cursor-pointer text-base
              ${
                location.pathname === item.path
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        )}
      </nav>
    </aside>
  );
}
