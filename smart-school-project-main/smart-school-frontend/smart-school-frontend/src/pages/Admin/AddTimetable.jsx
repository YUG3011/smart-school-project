// src/pages/Admin/AddTimetable.jsx
import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AddTimetable() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    class_name: "",
    subject: "",
    teacher_name: "",
    day: "",
    time: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/timetable", form);
      navigate("/timetable");
    } catch (err) {
      console.error("Add timetable failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-semibold mb-5">Add Timetable Entry</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="class_name"
          placeholder="Class Name"
          className="w-full border p-3 rounded"
          value={form.class_name}
          onChange={handleChange}
        />

        <input
          name="subject"
          placeholder="Subject"
          className="w-full border p-3 rounded"
          value={form.subject}
          onChange={handleChange}
        />

        <input
          name="teacher_name"
          placeholder="Teacher Name"
          className="w-full border p-3 rounded"
          value={form.teacher_name}
          onChange={handleChange}
        />

        <input
          name="day"
          placeholder="Day (e.g., Monday)"
          className="w-full border p-3 rounded"
          value={form.day}
          onChange={handleChange}
        />

        <input
          name="time"
          placeholder="Time (e.g., 10:00 AM)"
          className="w-full border p-3 rounded"
          value={form.time}
          onChange={handleChange}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Entry
        </button>
      </form>
    </div>
  );
}
