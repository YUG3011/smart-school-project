// src/pages/Admin/AttendancePage.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance");
      setAttendance(res.data.attendance || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Attendance Records</h2>

      {attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Face ID</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((a) => (
              <tr key={a.id} className="text-center">
                <td className="p-3 border">{a.id}</td>
                <td className="p-3 border">{a.face_id}</td>
                <td className="p-3 border">{a.status}</td>
                <td className="p-3 border">
                  {new Date(a.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
