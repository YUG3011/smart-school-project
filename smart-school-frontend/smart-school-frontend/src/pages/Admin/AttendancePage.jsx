import { useState } from "react";

export default function AttendancePage() {
  const [search, setSearch] = useState("");

  // Temporary student data (later comes from backend)
  const students = [
    { id: 1, name: "Chetan Yadav", status: "Present", time: "09:00 AM" },
    { id: 2, name: "Rahul Singh", status: "Absent", time: "--" },
    { id: 3, name: "Anjali Verma", status: "Present", time: "09:05 AM" },
  ];

  const filteredData = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-6">Attendance</h1>

      {/* Search box */}
      <input
        type="text"
        placeholder="Search student..."
        className="border p-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <table className="w-full border-collapse bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-3 text-left">Name</th>
            <th className="border p-3 text-left">Status</th>
            <th className="border p-3 text-left">Time</th>
            <th className="border p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((student) => (
            <tr key={student.id} className="border-b">
              <td className="p-3">{student.name}</td>
              <td className="p-3">
                {student.status === "Present" ? (
                  <span className="text-green-600 font-semibold">Present</span>
                ) : (
                  <span className="text-red-500 font-semibold">Absent</span>
                )}
              </td>
              <td className="p-3">{student.time}</td>
              <td className="p-3">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Mark Present
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
