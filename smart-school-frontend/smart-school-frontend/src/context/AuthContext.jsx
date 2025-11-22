import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  // save role on login
  const login = (userRole) => {
    setRole(userRole);
  };

  // logout
  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — THIS IS WHAT LOGIN PAGE NEEDS
export const useAuth = () => {
  return useContext(AuthContext);
};
