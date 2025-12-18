// src/components/layout/AppLayout.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Topbar from "./Topbar";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  // For mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebarMobile = () => setSidebarOpen(!sidebarOpen);

  // ---------------- MENU DEFINITIONS ----------------
    const adminMenu = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Mark Attendance", path: "/admin/attendance" },
    { label: "Students", path: "/admin/students" },
    { label: "Teachers", path: "/admin/teachers" },
    { label: "Timetable", path: "/admin/timetable" },
    { label: "AI Reports", path: "/admin/ai-reports" },
    { label: "Chatbot", path: "/chatbot" },
  ];

  const teacherMenu = [
    { label: "Dashboard", path: "/teacher/dashboard" },
    { label: "Mark Attendance", path: "/teacher/attendance" },
    { label: "Enroll Student", path: "/teacher/add-student" },
    { label: "Timetable", path: "/teacher/timetable" },
    { label: "Chatbot", path: "/chatbot" },
  ];

  const studentMenu = [
    { label: "Dashboard", path: "/student/dashboard" },
    { label: "My Attendance", path: "/student/my-attendance" },
    { label: "Timetable", path: "/student/timetable" },
    { label: "Chatbot", path: "/chatbot" },
  ];

  const menu =
    role === "admin"
      ? adminMenu
      : role === "teacher"
      ? teacherMenu
      : role === "student"
      ? studentMenu
      : [];

  // ---------------------------------------------------

  return (
    <div style={styles.wrapper}>
      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <div style={styles.sidebar} className="hidden md:flex flex-col">
        <h2 style={styles.logo}>Smart School</h2>

        {menu.map((item) => (
          <Link key={item.path} to={item.path} style={styles.link}>
            {item.label}
          </Link>
        ))}

        <button style={styles.logout} onClick={logout}>Logout</button>
      </div>

      {/* ---------------- MOBILE SIDEBAR ---------------- */}
      {sidebarOpen && (
        <div
          className="absolute z-30 w-60 bg-[#1e1e2f] h-full p-4 md:hidden flex flex-col"
          onClick={() => setSidebarOpen(false)}
        >
          <h2 style={styles.logo}>Smart School</h2>

          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={styles.link}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <button style={styles.logout} onClick={logout}>Logout</button>
        </div>
      )}

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <div style={styles.main}>
        <Topbar toggleSidebarMobile={toggleSidebarMobile} />

        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;

// -------------------- STYLES --------------------

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  sidebar: {
    width: "240px",
    backgroundColor: "#1e1e2f",
    padding: "20px",
  },

  logo: {
    color: "#ffffff",
    marginBottom: "25px",
    fontSize: "22px",
    fontWeight: "bold",
  },

  link: {
    color: "#c7c7c7",
    padding: "10px 0",
    textDecoration: "none",
    display: "block",
    fontSize: "16px",
  },

  logout: {
    marginTop: "auto",
    padding: "10px",
    backgroundColor: "#e63946",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },

  content: {
    flex: 1,
    padding: "25px",
    overflowY: "auto",
  },
};
