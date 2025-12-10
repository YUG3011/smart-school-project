// src/pages/Student/StudentDashboard.jsx

import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_days: 0,
    present_days: 0,
    percentage: 0,
    today_status: "Not Marked",
  });

  const [recent, setRecent] = useState([]);

  // Load student statistics
  const loadStats = async () => {
    try {
      const res1 = await API.get(`/student-attendance/${user.id}/stats`);
      const res2 = await API.get(`/student-attendance/${user.id}/today`);

      setStats({
        total_days: res1.data.total_days || 0,
        present_days: res1.data.present_days || 0,
        percentage: res1.data.percentage || 0,
        today_status: res2.data.status || "Not Marked",
      });
    } catch (err) {
      console.error("Student stats error:", err);
    }
  };

  // Load recent attendance history
  const loadRecent = async () => {
    try {
      const logs = await API.get(
        `/student-attendance/${user.id}/logs?limit=5`
      );
      setRecent(logs.data.data || []);
    } catch (err) {
      console.error("Recent logs error:", err);
    }
  };

  useEffect(() => {
    if (token) {
      loadStats();
      loadRecent();
    }
  }, [user, token]);

  return (
    <div className="p-4 md:p-6">

      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Total Days" count={stats.total_days} color="blue" />
        <SummaryCard title="Present Days" count={stats.present_days} color="green" />
        <SummaryCard title="Attendance %" count={`${stats.percentage}%`} color="purple" />
        <SummaryCard title="Today's Status" count={stats.today_status} color="orange" />
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <ActionButton
          label="Mark Attendance"
          onClick={() => navigate("/student-automatic-attendance")}
          color="blue"
        />

        <ActionButton
          label="View Attendance"
          onClick={() => navigate("/student-attendance")}
          color="green"
        />

        <ActionButton
          label="My Timetable"
          onClick={() => navigate("/student-timetable")}
          color="purple"
        />

        <ActionButton
          label="Chatbot"
          onClick={() => navigate("/chatbot")}
          color="orange"
        />
      </div>

      {/* Recent Attendance Logs */}
      <h2 className="text-xl font-semibold mb-3">Recent Attendance</h2>

      <div className="bg-white shadow rounded p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Time</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}

            {recent.map((log, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2">{log.date}</td>
                <td className="py-2">{log.time}</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                    Present
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}


/* =======================
   COMPONENTS
======================= */

function SummaryCard({ title, count, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <div className={`p-4 rounded shadow ${colors[color]}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}

function ActionButton({ label, onClick, color }) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    orange: "bg-orange-600 hover:bg-orange-700",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full py-3 text-white rounded font-semibold ${colors[color]}`}
    >
      {label}
    </button>
  );
}
