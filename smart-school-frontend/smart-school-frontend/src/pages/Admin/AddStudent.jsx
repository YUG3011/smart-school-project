import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

export default function AddStudent() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [className, setClassName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !email || !className) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.addStudent({
        name,
        email,
        class_name: className,
      });

      if (res.message === "Student added") {
        navigate("/admin/students"); // Go back to students list
      } else {
        setError("Failed to add student");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Add Student</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleAdd} className="bg-white p-6 shadow rounded-lg">
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
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
        >
          {loading ? "Adding..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}
