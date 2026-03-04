import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link
        to="/"
        style={{ textDecoration: "none", fontSize: "1.5rem", fontWeight: "bold" }}
      >
        Instagram Clone
      </Link>
      <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {isAuthenticated ? (
          <>
            <Link to="/feed" style={{ textDecoration: "none", color: "#000" }}>
              Feed
            </Link>
            <span>@{user?.username}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f0f0f0",
                border: "none",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: "none", color: "#000" }}>
              Login
            </Link>
            <Link to="/register" style={{ textDecoration: "none", color: "#000" }}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
