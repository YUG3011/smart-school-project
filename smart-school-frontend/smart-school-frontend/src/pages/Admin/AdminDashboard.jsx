export default function AdminDashboard() {
  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-gray-500">Total Students</h2>
          <p className="text-2xl font-bold">120</p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-gray-500">Teachers</h2>
          <p className="text-2xl font-bold">18</p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-gray-500">Classes Running</h2>
          <p className="text-2xl font-bold">12</p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-gray-500">Present Today</h2>
          <p className="text-2xl font-bold">96</p>
        </div>

      </div>

    </div>
  );
}
