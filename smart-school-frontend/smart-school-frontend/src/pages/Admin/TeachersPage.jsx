// src/pages/Teachers/TeachersPage.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import AddTeacher from "./AddTeacher";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);

  // Load teachers from backend
  const loadTeachers = async () => {
    const res = await api.getTeachers();
    setTeachers(res || []);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // Delete teacher
  const deleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      await api.deleteTeacher(id);
      loadTeachers();
    } catch (err) {
      console.error(err);
      alert("Error deleting teacher");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Teachers</h1>

      {/* Add Teacher Form */}
      <AddTeacher onAdded={loadTeachers} />

      {/* Teachers List */}
      <div className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Teachers List</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border">
                <td className="p-2 border">{t.name}</td>
                <td className="p-2 border">{t.subject}</td>
                <td className="p-2 border">{t.phone}</td>

                <td className="p-2 border text-center">
                  <button
                    onClick={() => deleteTeacher(t.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete ❌
                  </button>
                </td>
              </tr>
            ))}

            {teachers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-3 text-center text-gray-500">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
