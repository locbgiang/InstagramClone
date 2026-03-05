import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProfileUser {
  id: number;
  username: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
}

export const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${username}`);
        if (!response.ok) {
          throw new Error("User not found");
        }
        const data = await response.json();
        setProfile(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>;
  }

  if (error || !profile) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
        {error || "User not found"}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
      {/* Profile Header */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundColor: "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            color: "#888",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            profile.username[0].toUpperCase()
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <h2 style={{ margin: 0, fontWeight: 400, fontSize: "1.5rem" }}>
              {profile.username}
            </h2>
            {isOwnProfile && (
              <Link
                to="/edit-profile"
                style={{
                  padding: "0.4rem 1rem",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#000",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Edit Profile
              </Link>
            )}
          </div>

          {/* Stats row - placeholder for future post/follower counts */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginBottom: "0.75rem",
              fontSize: "0.95rem",
            }}
          >
            <span>
              <strong>0</strong> posts
            </span>
            <span>
              <strong>0</strong> followers
            </span>
            <span>
              <strong>0</strong> following
            </span>
          </div>

          {/* Name and Bio */}
          {profile.name && (
            <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>{profile.name}</p>
          )}
          {profile.bio && (
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Posts Grid - placeholder */}
      <div style={{ borderTop: "1px solid #ddd", paddingTop: "1.5rem" }}>
        <p
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: "0.9rem",
          }}
        >
          No posts yet.
        </p>
      </div>
    </div>
  );
};
