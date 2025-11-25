// src/pages/Admin/EditTimetable.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function EditTimetable() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    class_name: "",
    subject: "",
    teacher_name: "",
    day: "",
    time: "",
  });

  const fetchEntry = async () => {
    try {
      const res = await API.get(`/timetable/${id}`);
      setForm(res.data.timetable);
    } catch (err) {
      console.error("Error loading entry:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/timetable/${id}`, form);
      navigate("/timetable");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, []);

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-semibold mb-5">Edit Timetable Entry</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="class_name"
          value={form.class_name}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="teacher_name"
          value={form.teacher_name}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="day"
          value={form.day}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="time"
          value={form.time}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Entry
        </button>
      </form>
    </div>
  );
}
