import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  const fetchData = async () => {
    if (!user?.id) return;

    const res = await axios.get(
      `http://127.0.0.1:5000/api/teacher-attendance/get-attendance/${user.id}`
    );

    setRecords(res.data.records);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">My Students Attendance</h2>

      <table className="w-full border text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Student Name</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Time</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr>
              <td className="p-2 border">{r.student_name}</td>
              <td className="p-2 border">{r.date}</td>
              <td className="p-2 border">{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
