import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./roleSelection.css";

const RoleSelectionLogin = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");

  const goToLogin = () => {
    if (!selectedRole) return alert("Please select a role");
    navigate(`/login/${selectedRole}`);
  };

  return (
    <div className="role-container">
      <h1 className="role-title">Smart School Login</h1>

      <div className="role-cards">
        <div
          className={`role-card ${selectedRole === "admin" ? "active" : ""}`}
          onClick={() => setSelectedRole("admin")}
        >
          Admin
        </div>

        <div
          className={`role-card ${selectedRole === "teacher" ? "active" : ""}`}
          onClick={() => setSelectedRole("teacher")}
        >
          Teacher
        </div>

        <div
          className={`role-card ${selectedRole === "student" ? "active" : ""}`}
          onClick={() => setSelectedRole("student")}
        >
          Student
        </div>
      </div>

      <button className="role-button" onClick={goToLogin}>
        Continue
      </button>
    </div>
  );
};

export default RoleSelectionLogin;
