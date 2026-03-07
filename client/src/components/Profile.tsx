import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiUrl, uploadsUrl } from "../lib/api";
import { colors, buttonSecondaryStyle } from "../styles";
import { Avatar } from "./ui/Avatar";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface ProfileUser {
  id: number;
  username: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
}

interface Post {
  id: number;
  image: string;
  caption: string | null;
  createdAt: string;
}

export const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(apiUrl(`/api/profile/${username}`)),
          fetch(apiUrl(`/api/posts/user/${username}`)),
        ]);

        if (!profileRes.ok) {
          throw new Error("User not found");
        }

        const profileData = await profileRes.json();
        setProfile(profileData.user);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: colors.error }}>
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
        <Avatar src={profile.avatar} username={profile.username} size={120} />

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
                className="btn-secondary"
                style={{
                  ...buttonSecondaryStyle,
                  border: `1px solid ${colors.border}`,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Edit Profile
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginBottom: "0.75rem",
              fontSize: "0.95rem",
            }}
          >
            <span>
              <strong>{posts.length}</strong> {posts.length === 1 ? "post" : "posts"}
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

      {/* Posts Grid */}
      <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "1.5rem" }}>
        {posts.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: colors.textSecondary,
              fontSize: "0.9rem",
            }}
          >
            No posts yet.
          </p>
        ) : (
          <div
            className="post-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "4px",
            }}
          >
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                style={{ display: "block", aspectRatio: "1", overflow: "hidden" }}
              >
                <img
                  src={uploadsUrl(post.image)}
                  alt={post.caption || "Post"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
