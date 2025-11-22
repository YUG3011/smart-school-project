import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";

export default function EditTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    loadTeacher();
  }, []);

  async function loadTeacher() {
    const teachers = await api.getTeachers();
    const found = teachers.find((t) => String(t.id) === String(id));

    if (!found) {
      alert("Teacher not found");
      return;
    }

    setName(found.name);
    setEmail(found.email);
    setSubject(found.subject);
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      await api.updateTeacher(id, {
        name,
        email,
        subject,
      });

      navigate("/admin/teachers");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Teacher</h1>

      <form onSubmit={handleSave} className="bg-white p-6 shadow rounded">
        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Teacher Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
