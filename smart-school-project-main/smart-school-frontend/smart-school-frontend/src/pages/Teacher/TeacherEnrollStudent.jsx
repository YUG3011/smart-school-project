// smart-school-frontend/src/pages/Teacher/TeacherEnrollStudent.jsx
import React, { useState } from "react";
import CameraCapture from "../../components/camera/CameraCapture";
import axios from "axios";

export default function TeacherEnrollStudent() {
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

    try {
      const res = await axios.post(
        "/face/enroll",
        {
          ...form,
          image_base64: imageBase64,
        }
      );

      alert(res.data.message || "Student enrolled successfully!");
    } catch (err) {
      console.error(err);
      alert("Enrollment failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Teacher - Enroll Student</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Student Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 rounded"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="border p-2 rounded"
          placeholder="Class"
          onChange={(e) => setForm({ ...form, class_name: e.target.value })}
        />

        <input
          className="border p-2 rounded"
          placeholder="Section"
          onChange={(e) => setForm({ ...form, section: e.target.value })}
        />
      </div>

      <CameraCapture onCapture={(img) => setImageBase64(img)} />

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Enroll Student
      </button>
    </div>
  );
}
