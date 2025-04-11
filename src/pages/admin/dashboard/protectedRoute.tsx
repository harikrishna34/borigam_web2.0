// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../../../services/services/auth";
import { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = getAuthToken();
  
  if (!token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;