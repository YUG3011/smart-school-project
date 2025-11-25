// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ⭐ Toast notifications
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Global Toast Container */}
    <Toaster position="top-right" reverseOrder={false} />

    {/* Main App */}
    <App />
  </React.StrictMode>
);
