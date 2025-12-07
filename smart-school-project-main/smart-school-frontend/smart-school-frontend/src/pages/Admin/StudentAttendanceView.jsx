import { useEffect, useState } from "react";
import API from "../../services/api";
import Sidebar from "../../components/layout/Sidebar";

export default function StudentAttendanceViewPage() {
  const [summary, setSummary] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch classes and stats
  useEffect(() => {
    fetchClasses();
    fetchStats();
  }, []);

  // Fetch summary when class or dates change
  useEffect(() => {
    if (selectedClass) {
      fetchSummary();
    }
  }, [selectedClass, startDate, endDate]);

  const fetchClasses = async () => {
    try {
      const res = await API.get("/students");
      const uniqueClasses = [...new Set((res.data.students || []).map((s) => s.class_name))];
      setClasses(uniqueClasses);
      if (uniqueClasses.length > 0) {
        setSelectedClass(uniqueClasses[0]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/student-attendance/stats/overview");
      setStats(res.data.statistics);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/student-attendance/class/${selectedClass}/summary?start_date=${startDate}&end_date=${endDate}`
      );
      setSummary(res.data.summary || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Attendance Summary</h1>
            <p className="text-gray-600">View student attendance records and statistics</p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Today's Present</p>
                <p className="text-3xl font-bold text-green-600">{stats.today.present}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Today's Absent</p>
                <p className="text-3xl font-bold text-red-600">{stats.today.absent}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Today's Leave</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.today.leave}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Avg Attendance (30 days)</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.last_30_days.average_attendance_percentage}%
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchSummary}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-600">Loading...</div>
            ) : summary.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No attendance data found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        Present
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        Absent
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        Leave
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        Total Records
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        Attendance %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {record.name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                            {record.present_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                            {record.absent_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                            {record.leave_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          {record.total_records}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  record.attendance_percentage >= 80
                                    ? "bg-green-500"
                                    : record.attendance_percentage >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${record.attendance_percentage || 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {(record.attendance_percentage || 0).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
