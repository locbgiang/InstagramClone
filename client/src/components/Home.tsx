import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export const Home = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <Navigate to="/login" replace />;
};
