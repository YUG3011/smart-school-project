import React, { useState } from "react";
import RecognitionCamera from "../components/camera/RecognitionCamera";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

export default function UniversalAttendance() {
  const [mode, setMode] = useState("student");
  const [status, setStatus] = useState("");
  const [recognizedUser, setRecognizedUser] = useState(null);

  const handleRecognized = async ({ match, name, role, user_id }) => {
    if (!match) {
      setStatus("❌ Unknown face");
      return;
    }

    setRecognizedUser({ name, role, user_id });

    // Only allow marking when mode matches
    if (role !== mode) {
      setStatus(`⚠️ This is a ${role}, but mode is set to ${mode}`);
      return;
    }

    // CALL BACKEND TO MARK ATTENDANCE
    try {
      const res = await axios.post(`${API_URL}/face-recognition/mark-attendance`, {
        user_id,
        role
      });

      if (res.data.status === "marked") {
        setStatus(`✅ Attendance marked for ${name}`);
      } else if (res.data.status === "already_marked") {
        setStatus(`ℹ️ Attendance already marked for today`);
      } else {
        setStatus("Error marking attendance");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Automatic Attendance System</h2>

      {/* Mode toggle */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            mode === "student" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("student")}
        >
          Student
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === "teacher" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("teacher")}
        >
          Teacher
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Camera */}
        <div className="col-span-2">
          <RecognitionCamera onRecognized={handleRecognized} />
        </div>

        {/* Status */}
        <div className="col-span-1 bg-gray-50 p-4 rounded">
          <h3 className="font-semibold text-lg mb-3">Status</h3>

          <p className="text-sm">{status || "Waiting..."}</p>

          {recognizedUser && (
            <div className="mt-3 text-green-700">
              <b>{recognizedUser.name}</b> ({recognizedUser.role})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
