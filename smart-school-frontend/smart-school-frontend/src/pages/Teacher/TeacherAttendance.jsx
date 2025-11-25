// src/pages/Teacher/TeacherAttendance.jsx
import { useState } from "react";
import API from "../../services/api";

export default function TeacherAttendance() {
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.post("/attendance/mark", {
        face_id: studentId,
      });

      setMessage(res.data.message || "Attendance marked!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to mark attendance");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-5">Mark Attendance</h2>

      <form
        onSubmit={handleMarkAttendance}
        className="space-y-4 max-w-md bg-white shadow p-6 rounded"
      >
        <input
          type="text"
          placeholder="Enter Student Face ID"
          className="w-full border px-3 py-2 rounded"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Mark Attendance
        </button>
      </form>

      {message && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}
    </div>
  );
}
