// src/pages/Admin/FaceEnrollmentPage.jsx
import React, { useState } from "react";
import CameraCapture from "../../components/camera/CameraCapture";
import api from "../../services/api";

export default function FaceEnrollmentPage() {
  const [role, setRole] = useState("student"); // 'student' or 'teacher'
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    class_name: "",
    section: "",
    subject: "",
  });
  const [imageBase64, setImageBase64] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    if (!form.id) {
      alert("Please enter ID (e.g. ST10001 or T1001)");
      return;
    }
    if (!imageBase64) {
      alert("Please capture a photo before submitting.");
      return;
    }

    setStatus("Uploading...");

    const endpoint =
      role === "student"
        ? "/face-recognition/enroll/student"
        : "/face-recognition/enroll/teacher";

    const payload = {
      id: form.id,
      name: form.name,
      email: form.email,
      class_name: form.class_name,
      section: form.section,
      subject: form.subject,
      image_base64: imageBase64,
    };

    try {
      const res = await api.post(endpoint, payload);
      setStatus(res.data.message || "Enrollment successful");
      alert(res.data.message || "Enrollment successful");
      // optionally reset the form or keep for multiple enrollments
    } catch (err) {
      console.error("Enrollment error:", err);
      setStatus("Enrollment failed. See console or backend logs.");
      alert("Enrollment failed. Check backend terminal for errors.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Admin - Face Enrollment</h2>

      <div className="mb-3">
        <label className="block mb-2">Enroll For</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <input
          placeholder={role === "student" ? "Student ID (e.g. ST10001)" : "Teacher ID (e.g. T1001)"}
          className="border p-2 rounded"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
        />
        <input
          placeholder="Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          className="border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {role === "student" ? (
          <>
            <input
              placeholder="Class"
              className="border p-2 rounded"
              value={form.class_name}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
            />
            <input
              placeholder="Section"
              className="border p-2 rounded"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
            />
          </>
        ) : (
          <input
            placeholder="Subject"
            className="border p-2 rounded"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        )}
      </div>

      <div className="mb-4">
        <CameraCapture onCapture={(b64) => setImageBase64(b64)} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Enrollment
        </button>
        <div className="self-center text-sm text-gray-600">{status}</div>
      </div>
    </div>
  );
}
