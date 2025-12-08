// smart-school-frontend/src/pages/Login/RoleSelect.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setSelectedRole } = useAuth();

  const chooseRole = (role) => {
    setSelectedRole(role); // store role before login
    navigate("/login");   // go to login page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Select Your Role</h2>

        <div className="flex flex-col gap-4">
          <button
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            onClick={() => chooseRole("admin")}
          >
            Admin
          </button>

          <button
            className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            onClick={() => chooseRole("teacher")}
          >
            Teacher
          </button>

          <button
            className="bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700"
            onClick={() => chooseRole("student")}
          >
            Student
          </button>
        </div>
      </div>
    </div>
  );
}
