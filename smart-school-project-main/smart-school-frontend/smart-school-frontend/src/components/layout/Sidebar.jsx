// src/components/layout/Sidebar.jsx

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiBookOpen,
  FiMenu,
  FiCamera,
  FiClipboard,
  FiPieChart,
  FiMessageCircle,
} from "react-icons/fi";

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || "";
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  // -----------------------------
  // ADMIN MENU
  // -----------------------------
  const adminMenu = [
    { name: "Dashboard", path: "/admin-dashboard", icon: <FiHome /> },

    { section: "Attendance" },
    { name: "Face Attendance", path: "/face-attendance", icon: <FiCamera /> },
    { name: "Attendance Records", path: "/admin-attendance", icon: <FiClipboard /> },

    

    { section: "Management" },
    { name: "Students", path: "/students", icon: <FiUsers /> },
    { name: "Teachers", path: "/teachers", icon: <FiUsers /> },

    { section: "Academics" },
    { name: "Timetable", path: "/timetable", icon: <FiBookOpen /> },

    { section: "AI" },
    { name: "AI Reports", path: "/ai-reports", icon: <FiPieChart /> },

    { section: "Chat" },
    { name: "Chatbot", path: "/chatbot", icon: <FiMessageCircle /> },
  ];

  // -----------------------------
  // TEACHER MENU
  // -----------------------------
  const teacherMenu = [
    { name: "Dashboard", path: "/teacher-dashboard", icon: <FiHome /> },

    { section: "Attendance" },
    { name: "Face Attendance", path: "/face-attendance", icon: <FiCamera /> },
    { name: "Attendance Records", path: "/teacher-attendance", icon: <FiClipboard /> },

    { section: "Students" },
    { name: "Enroll Student", path: "/teacher-add-student", icon: <FiUserPlus /> },

    { section: "Academics" },
    { name: "My Timetable", path: "/teacher-timetable", icon: <FiBookOpen /> },

    { section: "Chat" },
    { name: "Chatbot", path: "/chatbot", icon: <FiMessageCircle /> },
  ];

  // -----------------------------
  // STUDENT MENU
  // -----------------------------
  const studentMenu = [
    { name: "Dashboard", path: "/student-dashboard", icon: <FiHome /> },

    { section: "Attendance" },
    { name: "Face Attendance", path: "/face-attendance", icon: <FiCamera /> },
    { name: "My Attendance", path: "/student-my-attendance", icon: <FiClipboard /> },

    { section: "Academics" },
    { name: "My Timetable", path: "/student-timetable", icon: <FiBookOpen /> },

    { section: "Chat" },
    { name: "Chatbot", path: "/chatbot", icon: <FiMessageCircle /> },
  ];

  // -----------------------------
  // PARENT MENU
  // -----------------------------
  const parentMenu = [
    { name: "Dashboard", path: "/parent-dashboard", icon: <FiHome /> },
    { name: "Performance", path: "/parent-performance", icon: <FiPieChart /> },
    { name: "Chatbot", path: "/chatbot", icon: <FiMessageCircle /> },
  ];

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
      ${collapsed ? "w-20" : "w-64"} hidden md:flex flex-col`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="text-xl font-semibold text-gray-800">Smart School</h2>
        )}
        <FiMenu className="text-xl cursor-pointer" onClick={toggleSidebar} />
      </div>

      {/* MENU */}
      <nav className="flex flex-col mt-4 px-2">
        {menu.map((item, idx) =>
          item.section ? (
            <div
              key={idx}
              className={`text-xs text-gray-500 uppercase mt-3 mb-1 ${
                collapsed ? "hidden" : "block"
              }`}
            >
              {item.section}
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 cursor-pointer text-sm
              ${
                location.pathname === item.path
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        )}
      </nav>
    </aside>
  );
}
