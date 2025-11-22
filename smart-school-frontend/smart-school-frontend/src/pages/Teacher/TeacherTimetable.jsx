export default function TeacherTimetable() {
  const myClasses = [
    { period: "9:00 AM", class: "8A", subject: "Math" },
    { period: "11:00 AM", class: "9B", subject: "Physics" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">My Timetable</h1>

      <table className="w-full bg-white shadow rounded border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-3 text-left">Period</th>
            <th className="border p-3 text-left">Class</th>
            <th className="border p-3 text-left">Subject</th>
          </tr>
        </thead>

        <tbody>
          {myClasses.map((c, index) => (
            <tr key={index}>
              <td className="border p-3">{c.period}</td>
              <td className="border p-3">{c.class}</td>
              <td className="border p-3">{c.subject}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
