import { useState } from "react";

export default function TeacherAttendance() {
  const [status, setStatus] = useState("Absent");
  const [time, setTime] = useState("--");

  const markAttendance = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setStatus("Present");
    setTime(formattedTime);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Mark Your Attendance</h1>

      <div className="bg-white p-6 shadow rounded w-full md:w-1/2">

        <p className="text-gray-600 text-lg">
          Status:{" "}
          {status === "Present" ? (
            <span className="text-green-600 font-bold">Present</span>
          ) : (
            <span className="text-red-500 font-bold">Absent</span>
          )}
        </p>

        <p className="mt-2 text-gray-700">Time: {time}</p>

        <button
          onClick={markAttendance}
          className="mt-4 bg-blue-500 text-white px-5 py-2 rounded"
        >
          Mark Attendance
        </button>
      </div>
    </div>
  );
}
