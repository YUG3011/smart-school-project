// src/pages/Admin/AddTimetable.jsx
import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AddTimetable() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    class_name: "1",
    section: "a",
    subject: "",
    teacher_name: "",
    day: "Monday",
    start_time: "",
    end_time: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/timetable/", form);
      navigate("/admin/timetable");
    } catch (err) {
      console.error("Add timetable failed:", err);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const sections = ["a", "b", "c", "d", "e", "f"];

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-semibold mb-5">Add Timetable Entry</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="class_name"
          className="w-full border p-3 rounded"
          value={form.class_name}
          onChange={handleChange}
        >
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          name="section"
          className="w-full border p-3 rounded"
          value={form.section}
          onChange={handleChange}
        >
          {sections.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>

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

        <select
          name="day"
          className="w-full border p-3 rounded"
          value={form.day}
          onChange={handleChange}
        >
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <input
          type="time"
          name="start_time"
          placeholder="Start Time"
          className="w-full border p-3 rounded"
          value={form.start_time}
          onChange={handleChange}
        />

        <input
          type="time"
          name="end_time"
          placeholder="End Time"
          className="w-full border p-3 rounded"
          value={form.end_time}
          onChange={handleChange}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Entry
        </button>
      </form>
    </div>
  );
}
