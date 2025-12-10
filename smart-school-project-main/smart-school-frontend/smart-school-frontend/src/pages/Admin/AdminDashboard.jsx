// src/pages/Admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    today_attendance: 0,
    classes: 0,
  });

  const [recent, setRecent] = useState([]);

  // Fetch Dashboard Summary
  const loadStats = async () => {
    try {
      const s = await API.get(`/students/count`);
      const t = await API.get(`/teachers/count`);
      const a = await API.get(`/attendance/today`);
      const c = await API.get(`/students/class-count`);

      setStats({
        students: s.data.count || 0,
        teachers: t.data.count || 0,
        today_attendance: a.data.count || 0,
        classes: c.data.count || 0,
      });
    } catch (err) {
      console.error("Stats Error:", err);
    }
  };

  // Fetch recent logs
  const loadRecent = async () => {
    try {
      const r = await API.get(`/attendance-view/all?limit=5`);
      setRecent(r.data.data || []);
    } catch (err) {
      console.error("Recent logs error:", err);
    }
  };

  useEffect(() => {
    if (token) {
      console.log("✓ Token available, loading stats...");
      loadStats();
      loadRecent();
    } else {
      console.log("✗ No token, waiting for authentication...");
    }
  }, [token]);

  return (
    <div className="p-4 md:p-6">

      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Students" count={stats.students} color="blue" />
        <SummaryCard title="Teachers" count={stats.teachers} color="green" />
        <SummaryCard title="Today Present" count={stats.today_attendance} color="purple" />
        <SummaryCard title="Classes" count={stats.classes} color="orange" />
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <ActionButton
          label="Mark Attendance"
          onClick={() => navigate("/admin/attendance")}
          color="blue"
        />

        <ActionButton
          label="Enroll Faces"
          onClick={() => navigate("/admin/face-enrollment")}
          color="green"
        />

        <ActionButton
          label="View Records"
          onClick={() => navigate("/admin/attendance")}
          color="purple"
        />

        <ActionButton
          label="Add Student"
          onClick={() => navigate("/admin/students")}
          color="orange"
        />

      </div>

      {/* Recent Attendance Logs */}
      <h2 className="text-xl font-semibold mb-3">Recent Attendance</h2>

      <div className="bg-white shadow rounded p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Role</th>
              <th className="py-2">Class</th>
              <th className="py-2">Time</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  No recent attendance logs
                </td>
              </tr>
            )}

            {recent.map((r, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2">{r.name}</td>
                <td className="py-2">{r.role}</td>
                <td className="py-2">{r.class_name || "-"}</td>
                <td className="py-2">{r.time}</td>
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
