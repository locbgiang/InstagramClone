import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Notifications } from "./Notifications";
import { colors, buttonSecondaryStyle } from "../styles";

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
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
      }}
    >
      <Link
        to="/"
        style={{ fontSize: "1.5rem", fontWeight: "bold", color: colors.text }}
      >
        Instagram Clone
      </Link>
      <nav
        className="header-nav"
        style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
      >
        {isAuthenticated ? (
          <>
            <Link to="/feed" className="btn-link" style={{ color: colors.text }}>
              Feed
            </Link>
            <Link to="/explore" className="btn-link" style={{ color: colors.text }}>
              Explore
            </Link>
            <Link
              to="/create"
              className="btn-link"
              style={{
                color: colors.text,
                fontSize: "1.5rem",
                lineHeight: 1,
              }}
            >
              +
            </Link>
            <Notifications />
            <Link to="/messages" className="btn-link" style={{ color: colors.text }}>
              Messages
            </Link>
            <Link
              to={`/${user?.username}`}
              className="btn-link"
              style={{ color: colors.text, fontWeight: 600 }}
            >
              @{user?.username}
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={buttonSecondaryStyle}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-link" style={{ color: colors.text }}>
              Login
            </Link>
            <Link to="/register" className="btn-link" style={{ color: colors.text }}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
