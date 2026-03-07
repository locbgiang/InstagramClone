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

export const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(email, username, password, name);
      navigate("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
        <h1 style={{ textAlign: "center", marginTop: 0 }}>Register</h1>
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
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputStyle}
              placeholder="username"
            />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Your name (optional)"
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
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <p style={{ marginTop: "1rem", textAlign: "center", color: colors.textSecondary }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: colors.primary, fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
