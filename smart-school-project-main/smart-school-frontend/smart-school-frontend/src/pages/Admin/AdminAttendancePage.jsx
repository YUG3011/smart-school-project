// src/pages/Admin/AdminAttendancePage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api/attendance-view/all";

export default function AdminAttendancePage() {
  const [records, setRecords] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchData = async () => {
    const params = {};

    if (roleFilter) params.role = roleFilter;
    if (dateFilter) params.date = dateFilter;

    const res = await axios.get(API, { params });
    setRecords(res.data.records);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Admin Attendance Records</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <table className="w-full border text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Time</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td className="p-2 border">{r.name}</td>
              <td className="p-2 border">{r.role}</td>
              <td className="p-2 border">{r.date}</td>
              <td className="p-2 border">{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
