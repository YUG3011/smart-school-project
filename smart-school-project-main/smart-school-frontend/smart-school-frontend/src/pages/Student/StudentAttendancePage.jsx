// src/pages/Student/StudentAttendancePage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://127.0.0.1:5000/api";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/student/attendance/${user.id}`
        );

        const data = res.data.attendance || [];
        setAttendance(data);

        let p = data.filter((d) => d.status === "Present").length;
        let a = data.length - p;

        setPresentCount(p);
        setAbsentCount(a);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    fetchAttendance();
  }, [user]);

  return (
    <div className="bg-white shadow p-6 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Attendance</h2>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <h3 className="text-lg font-semibold text-green-700">Present</h3>
          <p className="text-2xl font-bold">{presentCount}</p>
        </div>

        <div className="bg-red-100 p-4 rounded">
          <h3 className="text-lg font-semibold text-red-700">Absent</h3>
          <p className="text-2xl font-bold">{absentCount}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Time</th>
          </tr>
        </thead>

        <tbody>
          {attendance.map((rec, index) => (
            <tr key={index}>
              <td className="border p-2">{rec.date}</td>
              <td
                className={`border p-2 ${
                  rec.status === "Present" ? "text-green-600" : "text-red-600"
                }`}
              >
                {rec.status}
              </td>
              <td className="border p-2">{rec.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
