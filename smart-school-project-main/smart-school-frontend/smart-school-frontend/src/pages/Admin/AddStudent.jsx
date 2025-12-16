// src/pages/Admin/AddStudent.jsx
import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    class_name: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/students", form);
      navigate("/admin/students"); // back to admin list
    } catch (err) {
      console.error("Add student failed:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-5">Add Student</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

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

        <input
          name="class_name"
          placeholder="Class"
          value={form.class_name}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

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
