// src/pages/Login/LoginPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";   // ✅ correct path

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Call backend API
      const res = await api.login({
        email,
        password,
        role,
      });

      if (!res.token) {
        setError("Invalid credentials");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", res.token);

      // Redirect based on role
      if (role === "Admin") navigate("/admin");
      if (role === "Teacher") navigate("/teacher");
      if (role === "Student") navigate("/student");
      if (role === "Parent") navigate("/parent");
    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Smart School Login
        </h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        {/* Role Selection */}
        <select
          className="w-full border px-3 py-2 mb-3 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
          <option value="Parent">Parent</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
