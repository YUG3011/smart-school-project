// src/pages/Admin/TimetablePage.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";

export default function TimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState("1");
  const [section, setSection] = useState("a");

  const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const sections = ["a", "b", "c", "d", "e", "f"];

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/timetable/${className}/${section}`);
      setTimetable(res.data.timetable || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading timetable:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;

    try {
      await API.delete(`/timetable/${id}`);
      fetchTimetable();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold">Timetable</h2>
        <Link
          to="/admin/add-timetable"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Timetable
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="border p-2 rounded"
        >
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="border p-2 rounded"
        >
          {sections.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
        <button
          onClick={fetchTimetable}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Fetch Timetable
        </button>
      </div>

      {loading && <div className="p-6 text-lg">Loading...</div>}

      {!loading && timetable.length === 0 ? (
        <p>No timetable entries found for the selected class and section.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Class</th>
              <th className="p-3 border">Section</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Teacher</th>
              <th className="p-3 border">Day</th>
              <th className="p-3 border">Start Time</th>
              <th className="p-3 border">End Time</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {timetable.map((t) => (
              <tr key={t.id} className="text-center">
                <td className="p-3 border">{t.id}</td>
                <td className="p-3 border">{t.class_name}</td>
                <td className="p-3 border">{t.section.toUpperCase()}</td>
                <td className="p-3 border">{t.subject}</td>
                <td className="p-3 border">{t.teacher_name}</td>
                <td className="p-3 border">{t.day}</td>
                <td className="p-3 border">{t.start_time}</td>
                <td className="p-3 border">{t.end_time}</td>

                <td className="p-3 border space-x-3">
                  <Link
                    to={`/admin/edit-timetable/${t.id}`}
                    className="text-blue-600"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
