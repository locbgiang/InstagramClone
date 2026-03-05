import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
        {error && (
          <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
        )}

        {/* Avatar preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              color: "#888",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              user?.username[0].toUpperCase()
            )}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{user?.username}</p>
          </div>
        </div>

        {/* Avatar URL */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.25rem",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Avatar URL
          </label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.25rem",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Bio */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.25rem",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            rows={4}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: "#0095f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/${user?.username}`)}
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: "#f0f0f0",
              color: "#000",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
