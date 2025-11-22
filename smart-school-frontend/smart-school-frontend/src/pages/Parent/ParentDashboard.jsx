import React from "react";
import { FaUser, FaCalendarCheck, FaChartPie, FaFileDownload } from "react-icons/fa";

export default function ParentDashboard() {
  const child = {
    name: "Chetan Yadav",
    attendance: "92%",
    todayClasses: 3,
    performance: "Good",
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Parent Dashboard</h1>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Child Info */}
        <div className="bg-white shadow p-6 rounded-xl">
          <FaUser className="text-blue-600 text-3xl mb-3" />
          <h2 className="text-xl font-semibold">Child Name</h2>
          <p className="text-gray-600 mt-2">{child.name}</p>
        </div>

        {/* Attendance */}
        <div className="bg-white shadow p-6 rounded-xl">
          <FaCalendarCheck className="text-green-600 text-3xl mb-3" />
          <h2 className="text-xl font-semibold">Attendance</h2>
          <p className="mt-2 text-lg">{child.attendance}</p>
        </div>

        {/* Performance */}
        <div className="bg-white shadow p-6 rounded-xl">
          <FaChartPie className="text-purple-600 text-3xl mb-3" />
          <h2 className="text-xl font-semibold">Performance</h2>
          <p className="mt-2 text-lg">{child.performance}</p>
        </div>

      </div>

      {/* Timetable & Reports */}
      <div className="mt-10 bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Today's Timetable</h2>

        <ul className="space-y-2">
          <li className="border-b pb-2">09:00 — Maths</li>
          <li className="border-b pb-2">10:00 — Science</li>
          <li className="border-b pb-2">11:00 — English</li>
        </ul>
      </div>

      {/* Download Report */}
      <div className="mt-10 bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Report Card</h2>

        <button className="flex items-center gap-3 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">
          <FaFileDownload /> Download Report Card
        </button>
      </div>
    </div>
  );
}

