import { useEffect, useState } from "react";
import API from "../../services/api";
import Sidebar from "../../components/layout/Sidebar";

export default function StudentAttendancePage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch students and their classes
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch attendance for selected date and class
  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedDate, selectedClass]);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      const studentList = res.data.students || [];
      setStudents(studentList);

      // Extract unique class names
      const uniqueClasses = [...new Set(studentList.map((s) => s.class_name))];
      setClasses(uniqueClasses);

      if (uniqueClasses.length > 0) {
        setSelectedClass(uniqueClasses[0]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setMessage("Failed to fetch students");
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/student-attendance/by-date?date=${selectedDate}&class_name=${selectedClass}`
      );
      
      const attendanceMap = {};
      res.data.attendance.forEach((record) => {
        attendanceMap[record.student_id] = record.status;
      });
      
      setAttendance(attendanceMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Get filtered students for selected class
      const classStudents = students.filter((s) => s.class_name === selectedClass);

      // Prepare attendance data
      const attendanceList = classStudents.map((student) => ({
        student_id: student.id,
        class_name: selectedClass,
        status: attendance[student.id] || "absent",
        date: selectedDate,
        notes: null,
      }));

      // Submit bulk attendance
      const res = await API.post("/student-attendance/bulk-mark", {
        attendance: attendanceList,
      });

      if (res.data.results.success > 0) {
        setMessage(
          `✅ Attendance saved: ${res.data.results.success} marked, ${res.data.results.failed} failed`
        );
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          fetchAttendance(); // Refresh data
        }, 3000);
      } else {
        setMessage("❌ Failed to save attendance");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setMessage("Error submitting attendance");
      setLoading(false);
    }
  };

  const classStudents = students.filter((s) => s.class_name === selectedClass);

  const presentCount = classStudents.filter(
    (s) => attendance[s.id] === "present"
  ).length;
  const absentCount = classStudents.filter(
    (s) => attendance[s.id] === "absent"
  ).length;
  const leaveCount = classStudents.filter(
    (s) => attendance[s.id] === "leave"
  ).length;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Student Attendance</h1>
            <p className="text-gray-600">Mark attendance for students</p>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                submitted
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Summary
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm font-medium">
                    Present: {presentCount}
                  </span>
                  <span className="px-3 py-2 bg-red-100 text-red-800 rounded text-sm font-medium">
                    Absent: {absentCount}
                  </span>
                  <span className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                    Leave: {leaveCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-600">Loading...</div>
            ) : classStudents.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No students found in this class
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Roll #
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Email
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student, idx) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {student.email}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleStatusChange(student.id, "present")}
                                className={`px-4 py-2 rounded text-sm font-medium transition ${
                                  attendance[student.id] === "present"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-green-200"
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleStatusChange(student.id, "absent")}
                                className={`px-4 py-2 rounded text-sm font-medium transition ${
                                  attendance[student.id] === "absent"
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-red-200"
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => handleStatusChange(student.id, "leave")}
                                className={`px-4 py-2 rounded text-sm font-medium transition ${
                                  attendance[student.id] === "leave"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-yellow-200"
                                }`}
                              >
                                Leave
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Submit Button */}
                <div className="px-6 py-4 bg-gray-50 border-t flex gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-gray-400"
                  >
                    {loading ? "Saving..." : "Save Attendance"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
