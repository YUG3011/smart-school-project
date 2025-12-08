// smart-school-frontend/src/components/layout/Sidebar.jsx

import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiClock,
  FiBookOpen,
  FiPieChart,
  FiMessageCircle,
  FiUserPlus
} from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "";

  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  // ---------------------------
  // ADMIN MENU CONFIG
  // ---------------------------
  const adminMenu = [
    { name: "Dashboard", path: "/admin-dashboard", icon: <FiHome /> },
    { name: "Attendance", path: "/attendance", icon: <FiClock /> },
    { name: "Face Enrollment", path: "/face-enrollment", icon: <FiUserPlus /> },

    { name: "Students", path: "/students", icon: <FiUsers /> },
    { name: "Teachers", path: "/teachers", icon: <FiUsers /> },
    { name: "Timetable", path: "/timetable", icon: <FiBookOpen /> },

    { name: "AI Reports", path: "/ai-reports", icon: <FiPieChart /> },
    { name: "Chatbot", path: "/chatbot", icon: <FiMessageCircle /> }
  ];

  // ---------------------------
  // TEACHER MENU
  // ---------------------------
  const teacherMenu = [
    { name: "Dashboard", path: "/teacher-dashboard", icon: <FiHome /> },
    { name: "Attendance", path: "/attendance", icon: <FiClock /> },
    { name: "Enroll Student", path: "/teacher-add-student", icon: <FiUserPlus /> },
    { name: "Timetable", path: "/teacher-timetable", icon: <FiBookOpen /> },
    { name: "Chatbot", path: "/chatbot", icon: <FiMessageCircle /> }
  ];

  // ---------------------------
  // STUDENT MENU
  // ---------------------------
  const studentMenu = [
    { name: "Dashboard", path: "/student-dashboard", icon: <FiHome /> },
    { name: "My Attendance", path: "/my-attendance", icon: <FiClock /> },
    { name: "Timetable", path: "/student-timetable", icon: <FiBookOpen /> },
    { name: "Chatbot", path: "/chatbot", icon: <FiMessageCircle /> }
  ];
  
  const menu =
    role === "admin"
      ? adminMenu
      : role === "teacher"
      ? teacherMenu
      : role === "student"
      ? studentMenu
      : [];

  return (
    <aside
      className={`bg-white h-screen shadow-md transition-all duration-300
      ${collapsed ? "w-20" : "w-64"} hidden md:flex flex-col`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h2 className="text-xl font-semibold">Smart School</h2>}
        <FiMenu className="cursor-pointer text-xl" onClick={toggleSidebar} />
      </div>

      {/* MENU */}
      <nav className="flex flex-col mt-4">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg mx-2 mb-1
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
