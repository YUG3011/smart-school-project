// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  withCredentials: true,
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("🔍 [Axios Interceptor] Checking token...");
  console.log("   URL:", config.url);
  console.log("   Token exists in localStorage:", !!token);
  
  if (token) {
    console.log("   Token value:", token.substring(0, 30) + "...");
    config.headers.Authorization = `Bearer ${token}`;
    console.log("   ✓ Authorization header set to Bearer " + token.substring(0, 20) + "...");
  } else {
    console.log("   ✗ ERROR: NO TOKEN FOUND - Request will fail with 401!");
    console.log("   Available localStorage keys:", Object.keys(localStorage));
  }

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
