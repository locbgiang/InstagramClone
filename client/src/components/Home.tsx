import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "./ui/LoadingSpinner";

export const Home = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <Navigate to="/login" replace />;
};
