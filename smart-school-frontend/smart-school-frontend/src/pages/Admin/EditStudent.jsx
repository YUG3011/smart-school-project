import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [className, setClassName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load student by ID
  useEffect(() => {
    async function fetchStudent() {
      try {
        const all = await api.getStudents();
        const student = all.find((s) => String(s.id) === String(id));

        if (!student) {
          setError("Student not found");
          return;
        }

        setName(student.name);
        setEmail(student.email);
        setClassName(student.class_name);
      } catch (err) {
        console.error(err);
        setError("Failed to load student");
      }

      setLoading(false);
    }

    fetchStudent();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.updateStudent(id, {
        name,
        email,
        class_name: className,
      });

      if (res.message === "Updated") {
        navigate("/admin/students");
      } else {
        setError("Update failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Edit Student</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSave} className="bg-white p-6 shadow rounded-lg">
        <div className="mb-4">
          <label className="block font-semibold mb-1">Student Name</label>
          <input
            type="text"
            className="border w-full p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            className="border w-full p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Class</label>
          <input
            type="text"
            className="border w-full p-2 rounded"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. 10A"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
