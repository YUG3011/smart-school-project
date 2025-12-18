// FaceEnrollmentPage.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import CameraCapture from "../../components/CameraCapture";

export default function FaceEnrollmentPage() {
  const [role, setRole] = useState("student");
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------
  // Load students or teachers
  // ----------------------------------------
  useEffect(() => {
    const loadUsers = async () => {
      const endpoint = role === "student" ? "/students" : "/teachers";
      const res = await api.get(endpoint);
      setUsers(res.data || []);
    };
    loadUsers();
  }, [role]);

  // ----------------------------------------
  // Submit enrollment
  // ----------------------------------------
  const handleEnroll = async () => {
    if (!selectedId || !image) {
      alert("Select user and capture face");
      return;
    }

    try {
      setLoading(true);

      const user = users.find((u) => String(u.id) === String(selectedId)) || {};
      const payload = {
        id: user.email || `id-${selectedId}`,
        name: user.name || "",
        email: user.email || "",
        image_base64: image,
      };

      // Unified enrollment endpoint
      await api.post("/face/enroll", {
        role: role,
        user_id: Number(selectedId),
        image: image,
      });

      alert("Face enrolled successfully");
      setImage(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Face Enrollment</h2>

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>

      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="">Select</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <CameraCapture onCapture={setImage} />

      <button onClick={handleEnroll} disabled={loading}>
        {loading ? "Enrolling..." : "Enroll Face"}
      </button>
    </div>
  );
}
