export default function StudentTimetable() {
  const timetable = [
    { day: "Monday", period: "9:00 AM", subject: "Math" },
    { day: "Monday", period: "10:00 AM", subject: "Science" },
    { day: "Tuesday", period: "9:00 AM", subject: "English" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">My Timetable</h1>

      <table className="w-full bg-white shadow rounded border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-3 text-left">Day</th>
            <th className="border p-3 text-left">Period</th>
            <th className="border p-3 text-left">Subject</th>
          </tr>
        </thead>

        <tbody>
          {timetable.map((t, index) => (
            <tr key={index}>
              <td className="border p-3">{t.day}</td>
              <td className="border p-3">{t.period}</td>
              <td className="border p-3">{t.subject}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
