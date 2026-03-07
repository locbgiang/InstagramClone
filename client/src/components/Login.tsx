import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  colors,
  inputStyle,
  buttonPrimaryStyle,
  labelStyle,
  formGroupStyle,
  errorTextStyle,
} from "../styles";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "0 1rem" }}>
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "8px",
          padding: "2rem",
        }}
      >
        <h1 style={{ textAlign: "center", marginTop: 0 }}>Login</h1>
        {error && <div style={errorTextStyle}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{
              ...buttonPrimaryStyle,
              width: "100%",
              padding: "0.75rem",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ marginTop: "1rem", textAlign: "center", color: colors.textSecondary }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: colors.primary, fontWeight: 600 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
