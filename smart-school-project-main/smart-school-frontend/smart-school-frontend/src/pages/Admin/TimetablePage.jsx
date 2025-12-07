// src/pages/Admin/TimetablePage.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";

export default function TimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimetable = async () => {
    try {
      const res = await API.get("/timetable");
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

  useEffect(() => {
    fetchTimetable();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold">Timetable</h2>

        <Link
          to="/add-timetable"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Timetable
        </Link>
      </div>

      {timetable.length === 0 ? (
        <p>No timetable entries found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Class</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Teacher</th>
              <th className="p-3 border">Day</th>
              <th className="p-3 border">Time</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {timetable.map((t) => (
              <tr key={t.id} className="text-center">
                <td className="p-3 border">{t.id}</td>
                <td className="p-3 border">{t.class_name}</td>
                <td className="p-3 border">{t.subject}</td>
                <td className="p-3 border">{t.teacher_name}</td>
                <td className="p-3 border">{t.day}</td>
                <td className="p-3 border">{t.time}</td>

                <td className="p-3 border space-x-3">
                  <Link
                    to={`/edit-timetable/${t.id}`}
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
