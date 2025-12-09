// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Debugging
  console.log("📤 Request:", config.method.toUpperCase(), config.url, config.data);

  return config;
});

// Global error debugging
API.interceptors.response.use(
  (response) => {
    console.log("📥 Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// ------------ AUTH ----------
export const loginUser = (data) => API.post("/auth/login", data);

export default API;
