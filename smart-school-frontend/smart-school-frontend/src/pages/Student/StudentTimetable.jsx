import { useEffect, useState } from "react";
import API from "../../services/api";

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    API.get("/timetable")
      .then((res) => setTimetable(res.data.timetable || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Class Timetable</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 border">Class</th>
            <th className="p-3 border">Subject</th>
            <th className="p-3 border">Teacher</th>
            <th className="p-3 border">Day</th>
            <th className="p-3 border">Time</th>
          </tr>
        </thead>

        <tbody>
          {timetable.map((t) => (
            <tr key={t.id} className="text-center">
              <td className="p-3 border">{t.class_name}</td>
              <td className="p-3 border">{t.subject}</td>
              <td className="p-3 border">{t.teacher_name}</td>
              <td className="p-3 border">{t.day}</td>
              <td className="p-3 border">{t.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
