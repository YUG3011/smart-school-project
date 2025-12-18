// src/pages/Admin/AddTeacher.jsx
import { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import CameraCapture from "../../components/camera/CameraCapture";

export default function AddTeacher() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id_code: "",
    name: "",
    email: "",
    subject: "",
  });
  const [createdId, setCreatedId] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateTeacherId = () => {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `T${n}`;
  };

  useEffect(() => {
    if (!form.id_code) setForm((f) => ({ ...f, id_code: generateTeacherId() }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageBase64) {
      alert("Please enroll the teacher's face using the camera before submitting.");
      return;
    }

    try {
      // 1) Create teacher record
      const createRes = await API.post("/teachers", {
        id_code: form.id_code,
        name: form.name,
        email: form.email,
        subject: form.subject,
      });

      const teacherId = createRes.data?.id;
      setCreatedId(teacherId || null);

      // 2) Enroll face
      if (teacherId) {
        await API.post("/face/enroll", {
          role: "teacher",
          user_id: teacherId,
          image: imageBase64,
        });
      }

      navigate("/admin/teachers");
    } catch (err) {
      console.error("Add teacher failed:", err);
      alert("Enrollment failed. See console for details.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-5">Add Teacher</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="flex items-center gap-2">
          <input
            name="id_code"
            placeholder="Teacher ID (e.g. T1001)"
            value={form.id_code}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <button type="button" onClick={() => setForm(f => ({...f, id_code: generateTeacherId()}))} className="px-3 py-2 bg-gray-200 rounded">New</button>
        </div>

        <input
          name="name"
          placeholder="Teacher Name"
          value={form.name}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <input
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        {createdId && (
          <input
            name="id"
            placeholder="Created ID"
            value={createdId}
            readOnly
            className="border p-3 rounded w-full bg-gray-100 mt-2"
          />
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Enroll Face (required)</label>
          <CameraCapture onCapture={(b64) => setImageBase64(b64)} />
          {imageBase64 && (
            <img src={imageBase64} alt="captured" className="mt-3 w-48 h-auto rounded border" />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Teacher
        </button>
      </form>
    </div>
  );
}
