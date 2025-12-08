// src/pages/Login/LoginPage.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

const LoginPage = () => {
  const { login, selectedRole } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // If no role selected → redirect to /role
  useEffect(() => {
    if (!selectedRole) {
      navigate("/role");
    }
  }, [selectedRole, navigate]);


  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // LOGIN SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Please select a role before logging in");
      navigate("/role");
      return;
    }

    try {
      // Correct endpoint based on selectedRole
      const endpoint = `${API_URL}/auth/login/${selectedRole}`;

      const res = await axios.post(endpoint, form);
      const token = res.data.token;
      const user = res.data.user; // backend must return { name, email, role }

      if (!token || !user) {
        setError("Invalid response from server");
        return;
      }

      // Save user & token into AuthContext
      login(user, token);

      // Redirect based on role
      switch (user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "teacher":
          navigate("/teacher-dashboard");
          break;
        case "student":
          navigate("/student-dashboard");
          break;
        default:
          navigate("/");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    }
  };


  // RENDER UI
  return (
    <div className="login-container w-full h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Login as {selectedRole ? selectedRole.toUpperCase() : ""}
        </h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 mb-3 rounded"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 mb-3 rounded"
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
};

export default LoginPage;
