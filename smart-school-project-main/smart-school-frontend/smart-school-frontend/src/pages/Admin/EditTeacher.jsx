// src/pages/Admin/EditTeacher.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function EditTeacher() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
  });

  const fetchTeacher = async () => {
    try {
      const res = await API.get(`/teachers/${id}`);
      setForm(res.data.teacher);
    } catch (err) {
      console.error("Error fetching teacher:", err);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/teachers/${id}`, form);
      navigate("/teachers");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-5">Edit Teacher</h2>

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

        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Teacher
        </button>
      </form>
    </div>
  );
}
