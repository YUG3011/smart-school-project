import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // remove role from context
    navigate("/login"); // redirect to login page
  };

  return (
    <header className="w-full h-14 bg-white shadow-sm flex items-center justify-between px-6">
      
      {/* LEFT SIDE - PAGE TITLE (Optional, can add dynamic) */}
      <h1 className="text-lg font-semibold">Smart School Dashboard</h1>

      {/* RIGHT SIDE - ROLE + LOGOUT */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-700">
          Role: <span className="text-blue-600">{role}</span>
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
