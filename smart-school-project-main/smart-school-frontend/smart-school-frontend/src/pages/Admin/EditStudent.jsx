// src/pages/Admin/EditStudent.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    class_name: "",
  });

  const fetchStudent = async () => {
    try {
      const res = await API.get(`/students/${id}`);
      setForm(res.data.student);
    } catch (err) {
      console.error("Error loading student:", err);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/students/${id}`, form);
      navigate("/admin/students");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-5">Edit Student</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <input
          name="email"
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
          <select name="section" value={form.section || "A"} onChange={handleChange} className="border p-3 rounded w-full mt-1">
            {["A","B","C","D","E","F"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Student
        </button>
      </form>
    </div>
  );
}
