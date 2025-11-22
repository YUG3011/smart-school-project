import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function StudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch students on page load
  const loadStudents = async () => {
    try {
      const res = await api.getStudents();
      setStudents(res);
    } catch (err) {
      console.error(err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Delete Student
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await api.deleteStudent(id);
      loadStudents(); // Refresh table
    } catch (err) {
      console.error(err);
      alert("Failed to delete student");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold">Students</h1>

        <button
          onClick={() => navigate("/admin/students/add")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
        >
          + Add Student
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 mb-4 text-center">{error}</p>
      )}

      {/* Loading */}
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Class</th>
                <th className="p-3 border w-32">Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{s.id}</td>
                    <td className="p-3 border">{s.name}</td>
                    <td className="p-3 border">{s.email}</td>
                    <td className="p-3 border">{s.class_name}</td>

                    <td className="p-3 border flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/students/edit/${s.id}`)}
                        className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
