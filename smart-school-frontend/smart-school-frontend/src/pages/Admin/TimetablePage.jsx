import { useState } from "react";

export default function TimetablePage() {
  const [timetable, setTimetable] = useState([
    // Dummy data — backend will replace this
    { id: 1, className: "10-A", subject: "Math", teacher: "Anita Sharma", day: "Monday", time: "09:00 AM" },
    { id: 2, className: "9-B", subject: "Science", teacher: "Ravi Kumar", day: "Tuesday", time: "10:00 AM" },
  ]);

  // Form states
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const addTimetableEntry = (e) => {
    e.preventDefault();

    if (!className || !subject || !teacher || !day || !time) {
      alert("All fields are required!");
      return;
    }

    const newEntry = {
      id: Date.now(),
      className,
      subject,
      teacher,
      day,
      time,
    };

    setTimetable((prev) => [...prev, newEntry]);

    // Clear form
    setClassName("");
    setSubject("");
    setTeacher("");
    setDay("");
    setTime("");
  };

  const deleteEntry = (id) => {
    setTimetable((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Class Timetable</h1>

      {/* ADD TIMETABLE FORM */}
      <form
        onSubmit={addTimetableEntry}
        className="bg-white p-5 rounded shadow mb-8 grid grid-cols-3 gap-4"
      >
        <input
          type="text"
          placeholder="Class (e.g. 10-A)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Teacher Name"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Day</option>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
          <option>Saturday</option>
        </select>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="col-span-3 bg-green-500 hover:bg-green-600 text-white p-2 rounded"
        >
          Add Timetable Entry
        </button>
      </form>

      {/* TIMETABLE TABLE */}
      <div className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Current Timetable</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Teacher</th>
              <th className="p-2 border">Day</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {timetable.map((t) => (
              <tr key={t.id} className="border">
                <td className="p-2 border">{t.className}</td>
                <td className="p-2 border">{t.subject}</td>
                <td className="p-2 border">{t.teacher}</td>
                <td className="p-2 border">{t.day}</td>
                <td className="p-2 border">{t.time}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => deleteEntry(t.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete ❌
                  </button>
                </td>
              </tr>
            ))}

            {timetable.length === 0 && (
              <tr>
                <td colSpan="6" className="p-3 text-center text-gray-500">
                  No timetable entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
