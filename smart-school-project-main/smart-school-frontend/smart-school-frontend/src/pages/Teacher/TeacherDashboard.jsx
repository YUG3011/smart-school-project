import { FiCamera, FiBookOpen, FiClock, FiFileText } from "react-icons/fi";

export default function TeacherDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Mark Attendance */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
          <FiCamera size={40} className="text-blue-600 mb-3" />
          <h2 className="text-xl font-semibold">Mark Attendance</h2>
          <p className="text-gray-600 text-center mt-2 mb-4">
            Use face recognition to mark your attendance.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Start Camera
          </button>
        </div>

        {/* Today's Classes */}
        <div className="bg-white p-6 rounded-xl shadow">
          <FiClock size={40} className="text-green-600 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Today's Classes</h2>

          <ul className="text-gray-700">
            <li>08:00 - 09:00 — Class 10A (Maths)</li>
            <li>10:00 - 11:00 — Class 9A (Science)</li>
            <li>12:00 - 01:00 — Class 8A (Maths)</li>
          </ul>
        </div>

        {/* AI Tutor Status */}
        <div className="bg-white p-6 rounded-xl shadow">
          <FiBookOpen size={40} className="text-purple-600 mb-3" />
          <h2 className="text-xl font-semibold mb-2">AI Tutor Status</h2>
          <p className="text-gray-600">Your AI tutor is active for class 10A.</p>
        </div>

      </div>

      {/* Notes Section */}
      <div className="bg-white p-6 rounded-xl shadow mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Uploaded Notes</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FiFileText /> Upload Notes
          </button>
        </div>

        <ul className="text-gray-700">
          <li className="border-b py-2">• Chapter 1 - Algebra Notes.pdf</li>
          <li className="border-b py-2">• Physics Practical Guide.docx</li>
          <li className="border-b py-2">• Geometry Assignment 2.pdf</li>
        </ul>
      </div>
    </div>
  );
}
