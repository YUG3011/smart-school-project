// src/pages/Admin/StudentsPage.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch students from backend
  const fetchStudents = async () => {
    try {
      const response = await API.get("/students");

      console.log("STUDENT LIST RESPONSE:", response.data);

      const list = Array.isArray(response.data.students)
        ? response.data.students
        : [];

      setStudents(list);
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]); // prevent frontend crash
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await API.delete(`/students/${id}`);
      fetchStudents(); // refresh table
      window.dispatchEvent(new CustomEvent("entityChanged"));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading students...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Students</h2>

        <Link
          to="/admin/add-student"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Student
        </Link>
      </div>

      {/* Empty state */}
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Class</th>
              <th className="p-3 border">Section</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="text-center">
                <td className="p-3 border">{s.id}</td>
                <td className="p-3 border">{s.name}</td>
                <td className="p-3 border">{s.email}</td>
                <td className="p-3 border">{s.class_name || "—"}</td>
                <td className="p-3 border">{s.section || "—"}</td>

                <td className="p-3 border space-x-3">
                  <Link to={`/admin/edit-student/${s.id}`} className="text-blue-600">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
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
