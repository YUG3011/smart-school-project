// src/pages/Admin/AddStudent.jsx
import { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import CameraCapture from "../../components/camera/CameraCapture";

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    roll_number: "",
    id_code: "",
    name: "",
    email: "",
    class_name: "1",
    section: "A",
  });
  const [createdId, setCreatedId] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // generate default ID like ST1001
  const generateStudentId = () => {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `ST${n}`;
  };

  useEffect(() => {
    if (!form.id_code) setForm((f) => ({ ...f, id_code: generateStudentId() }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageBase64) {
      alert("Please enroll the student's face using the camera before submitting.");
      return;
    }

    try {
      // 1) Create student record
      const createRes = await API.post("/students", {
        roll_number: form.roll_number,
        id_code: form.id_code,
        name: form.name,
        email: form.email,
        class_name: form.class_name,
        section: form.section || "",
      });

      const studentId = createRes.data?.id;
      setCreatedId(studentId || null);

      // 2) Enroll face using the unified API
      if (studentId) {
        await API.post("/face/enroll", {
          role: "student",
          user_id: studentId,
          image: imageBase64,
        });
      }

      window.dispatchEvent(new CustomEvent("entityChanged"));
      navigate("/admin/students");
    } catch (err) {
      console.error("Add student failed:", err);
      alert("Enrollment failed. See console for details.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-5">Add Student</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="flex items-center gap-2">
          <input
            name="id_code"
            placeholder="Student ID (e.g. ST1001)"
            value={form.id_code}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <button type="button" onClick={() => setForm(f => ({...f, id_code: generateStudentId()}))} className="px-3 py-2 bg-gray-200 rounded">New</button>
        </div>

        <input
          name="roll_number"
          placeholder="Roll Number"
          value={form.roll_number}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        {createdId && (
          <input
            name="id"
            placeholder="Created ID"
            value={createdId}
            readOnly
            className="border p-3 rounded w-full bg-gray-100 mt-2"
          />
        )}

        <input
          name="name"
          placeholder="Student Name"
          value={form.name}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <label className="block">
          <span className="text-sm">Class</span>
          <select name="class_name" value={form.class_name} onChange={handleChange} className="border p-3 rounded w-full mt-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
              <option key={c} value={String(c)}>{`Class ${c}`}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Section</span>
          <select name="section" value={form.section} onChange={handleChange} className="border p-3 rounded w-full mt-1">
            {["A","B","C","D","E","F"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <div>
          <label className="block text-sm font-medium mb-2">Enroll Face (required)</label>
          <CameraCapture onCapture={(b64) => setImageBase64(b64)} />
          {imageBase64 && (
            <img src={imageBase64} alt="captured" className="mt-3 w-48 h-auto rounded border" />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Student
        </button>
      </form>
    </div>
  );
}
