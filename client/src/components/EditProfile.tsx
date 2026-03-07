import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  colors,
  inputStyle,
  textareaStyle,
  buttonPrimaryStyle,
  buttonSecondaryStyle,
  labelStyle,
  formGroupStyle,
  errorTextStyle,
} from "../styles";
import { Avatar } from "./ui/Avatar";

export const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await updateUser({ name, bio, avatar: avatar || undefined });
      navigate(`/${user?.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        {error && <p style={errorTextStyle}>{error}</p>}

        {/* Avatar preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <Avatar src={avatar || user?.avatar} username={user?.username || ""} size={60} />
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{user?.username}</p>
          </div>
        </div>

        {/* Avatar URL */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Avatar URL</label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            style={inputStyle}
          />
        </div>

        {/* Name */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>

        {/* Bio */}
        <div style={{ ...formGroupStyle, marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            rows={4}
            style={textareaStyle}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{
              ...buttonPrimaryStyle,
              opacity: isSaving ? 0.6 : 1,
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/${user?.username}`)}
            style={{
              ...buttonSecondaryStyle,
              border: `1px solid ${colors.border}`,
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
