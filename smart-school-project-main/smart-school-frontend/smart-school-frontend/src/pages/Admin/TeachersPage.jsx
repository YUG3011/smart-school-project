// src/pages/Admin/TeachersPage.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      const res = await API.get("/teachers");
      setTeachers(res.data.teachers || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;

    try {
      await API.delete(`/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Teachers</h2>

        <Link
          to="/add-teacher"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Teacher
        </Link>
      </div>

      {teachers.length === 0 ? (
        <p>No teachers found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="text-center">
                <td className="p-3 border">{t.id}</td>
                <td className="p-3 border">{t.name}</td>
                <td className="p-3 border">{t.email}</td>
                <td className="p-3 border">{t.subject}</td>
                <td className="p-3 border space-x-3">
                  <Link
                    to={`/edit-teacher/${t.id}`}
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
