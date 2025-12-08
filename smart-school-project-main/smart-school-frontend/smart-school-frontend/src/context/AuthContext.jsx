// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW — This stores the role selected on /role page
  const [selectedRole, setSelectedRole] = useState(null);

  // Load user/token from localStorage when app loads
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (
        savedToken &&
        savedUser &&
        savedUser !== "undefined" &&
        savedUser !== "null"
      ) {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Auth parsing error:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  // Login function
  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);

    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));

    // Save role for reloading dashboard after refresh
    if (userData?.role) {
      localStorage.setItem("selectedRole", userData.role);
      setSelectedRole(userData.role);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setSelectedRole(null);

    localStorage.clear();
    window.location.href = "/login";
  };

  // Persist selectedRole (in case of page reload)
  useEffect(() => {
    const savedRole = localStorage.getItem("selectedRole");
    if (savedRole) setSelectedRole(savedRole);
  }, []);

  // Save role when changed
  useEffect(() => {
    if (selectedRole) {
      localStorage.setItem("selectedRole", selectedRole);
    }
  }, [selectedRole]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,

        // NEW → Role Selection
        selectedRole,
        setSelectedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
