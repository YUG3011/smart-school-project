import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// roleRequired → "Admin", "Teacher", etc.

export default function ProtectedRoute({ children, roleRequired }) {
  const { role } = useAuth();

  // not logged in
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // logged in but wrong role
  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
