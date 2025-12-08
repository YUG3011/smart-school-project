// smart-school-frontend/src/pages/Admin/FaceEnrollmentPage.jsx
import React, { useState } from "react";
import CameraCapture from "../../components/camera/CameraCapture";
import axios from "axios";

export default function FaceEnrollmentPage() {
  const [role, setRole] = useState("student");

  const [form, setForm] = useState({
    name: "",
    email: "",
    class_name: "",
    section: "",
  });

  const [imageBase64, setImageBase64] = useState(null);

  const API_URL = "http://127.0.0.1:5000/api";

  const handleSubmit = async () => {
    if (!imageBase64) return alert("Capture a face image first!");

    const endpoint =
      role === "teacher"
        ? `${API_URL}/face-recognition/enroll-teacher`
        : `${API_URL}/face-recognition/enroll`;

    try {
      const res = await axios.post(endpoint, {
        ...form,
        image_base64: imageBase64,
      });

      alert(res.data.message || "Enrollment successful!");
    } catch (err) {
      console.error(err);
      alert("Enrollment failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Admin - Face Enrollment</h2>

      {/* Select Role */}
      <label className="font-semibold">Enroll For:</label>
      <select
        className="border p-2 rounded mb-4 block"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>

      {/* Input Form */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 rounded"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {role === "student" && (
          <>
            <input
              className="border p-2 rounded"
              placeholder="Class"
              onChange={(e) =>
                setForm({ ...form, class_name: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Section"
              onChange={(e) =>
                setForm({ ...form, section: e.target.value })
              }
            />
          </>
        )}
      </div>

      {/* Camera Component */}
      <CameraCapture onCapture={(img) => setImageBase64(img)} />

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Submit Enrollment
      </button>
    </div>
  );
}
