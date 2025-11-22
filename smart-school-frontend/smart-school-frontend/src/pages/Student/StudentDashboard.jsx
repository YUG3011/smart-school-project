import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

      {/* CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Attendance</h2>
          <p className="text-3xl font-bold text-blue-600">89%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Upcoming Class</h2>
          <p className="text-gray-600">Maths – 10:00 AM</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">AI Tutor Status</h2>
          <p className="text-green-600 font-semibold">Active</p>
        </div>

      </div>

      {/* ACTIONS SECTION */}
      <div className="bg-white p-6 rounded-lg shadow w-full md:w-2/3">

        <h2 className="text-xl font-semibold mb-4">Your Learning Tools</h2>

        <div className="flex flex-col gap-4">

          {/* Start Quiz Button */}
          <Link to="/quiz">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full text-left">
              📘 Start Quiz
            </button>
          </Link>

          {/* Chatbot Button */}
          <Link to="/chatbot">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full text-left">
              🤖 Ask Chatbot
            </button>
          </Link>

          {/* Text-to-Speech Button */}
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full text-left">
            🔊 Listen to Lessons
          </button>

        </div>

      </div>
    </div>
  );
}
