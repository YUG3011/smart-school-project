import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiBookOpen, FiClock, FiPieChart } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { role } = useAuth();

  // ============================
  // ROLE-BASED MENUS
  // ============================

  const adminMenu = [
    { name: "Dashboard", path: "/admin-dashboard", icon: <FiHome /> },
    { name: "Attendance", path: "/attendance", icon: <FiClock /> },
    { name: "Students", path: "/students", icon: <FiUsers /> },
    { name: "Add Student", path: "/add-student", icon: <FiUsers /> },
    { name: "Teachers", path: "/teachers", icon: <FiUsers /> },
    { name: "Add Teacher", path: "/add-teacher", icon: <FiUsers /> },
    { name: "Timetable", path: "/timetable", icon: <FiBookOpen /> },
    { name: "AI Reports", path: "/ai-reports", icon: <FiPieChart /> },
    { name: "Chatbot", path: "/chatbot", icon: <FiPieChart /> },
  ];

  const teacherMenu = [
    { name: "Dashboard", path: "/teacher-dashboard", icon: <FiHome /> },
    { name: "My Attendance", path: "/teacher-attendance", icon: <FiClock /> },
    { name: "My Timetable", path: "/teacher-timetable", icon: <FiBookOpen /> },
    { name: "Chatbot", path: "/chatbot", icon: <FiPieChart /> },
  ];

  const studentMenu = [
    { name: "Dashboard", path: "/student-dashboard", icon: <FiHome /> },
    { name: "My Timetable", path: "/student-timetable", icon: <FiClock /> },
    { name: "Start Quiz", path: "/student-quiz", icon: <FiBookOpen /> },
    { name: "Chatbot", path: "/chatbot", icon: <FiPieChart /> },
  ];

  const parentMenu = [
    { name: "Dashboard", path: "/parent-dashboard", icon: <FiHome /> },
    { name: "Performance", path: "/parent-performance", icon: <FiPieChart /> },
    { name: "Chatbot", path: "/chatbot", icon: <FiBookOpen /> },
  ];

  const menu =
    role === "Admin"
      ? adminMenu
      : role === "Teacher"
      ? teacherMenu
      : role === "Student"
      ? studentMenu
      : role === "Parent"
      ? parentMenu
      : [];

  return (
    <aside className="w-64 bg-white h-screen shadow-sm p-4 hidden md:block">
      <h2 className="text-xl font-semibold mb-6">Smart School</h2>

      <nav className="flex flex-col gap-3">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded 
              ${
                location.pathname === item.path
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
