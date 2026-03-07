import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiUrl, uploadsUrl } from "../lib/api";
import { colors, buttonPrimaryStyle } from "../styles";
import { Avatar } from "./ui/Avatar";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface PostUser {
  id: number;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface Post {
  id: number;
  image: string;
  caption: string | null;
  createdAt: string;
  user: PostUser;
  _count: { likes: number; comments: number };
  isLiked: boolean;
}

export const Feed = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(apiUrl("/api/posts"), { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const toggleLike = async (postId: number) => {
    try {
      const response = await fetch(apiUrl(`/api/posts/${postId}/like`), {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: data.liked, _count: { ...p._count, likes: data.likesCount } }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
          Welcome, {user?.name || user?.username}!
        </h1>
        <Link
          to="/create"
          className="btn-primary"
          style={{
            ...buttonPrimaryStyle,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ textAlign: "center", color: colors.textSecondary }}>
          No posts yet. Be the first to share!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: colors.surface,
              }}
            >
              {/* Post header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                }}
              >
                <Avatar src={post.user.avatar} username={post.user.username} size={32} />
                <Link
                  to={`/${post.user.username}`}
                  style={{
                    fontWeight: 600,
                    color: colors.text,
                    fontSize: "0.875rem",
                  }}
                >
                  {post.user.username}
                </Link>
              </div>

              {/* Post image */}
              <Link to={`/post/${post.id}`}>
                <img
                  src={uploadsUrl(post.image)}
                  alt={post.caption || "Post"}
                  style={{ width: "100%", display: "block" }}
                />
              </Link>

              {/* Actions */}
              <div style={{ padding: "0.5rem 1rem" }}>
                {isAuthenticated && (
                  <button
                    onClick={() => toggleLike(post.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.5rem",
                      padding: "0",
                      color: post.isLiked ? colors.liked : colors.text,
                    }}
                  >
                    {post.isLiked ? "\u2764\uFE0F" : "\u2661"}
                  </button>
                )}
                {post._count.likes > 0 && (
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", margin: "0.25rem 0" }}>
                    {post._count.likes} {post._count.likes === 1 ? "like" : "likes"}
                  </p>
                )}
              </div>

              {/* Caption */}
              {post.caption && (
                <div style={{ padding: "0 1rem" }}>
                  <span>
                    <Link
                      to={`/${post.user.username}`}
                      style={{
                        fontWeight: 600,
                        color: colors.text,
                        marginRight: "0.5rem",
                      }}
                    >
                      {post.user.username}
                    </Link>
                    {post.caption}
                  </span>
                </div>
              )}

              {/* Comments link */}
              {post._count.comments > 0 && (
                <Link
                  to={`/post/${post.id}`}
                  style={{
                    display: "block",
                    padding: "0.25rem 1rem",
                    color: colors.textSecondary,
                    fontSize: "0.875rem",
                  }}
                >
                  View all {post._count.comments} {post._count.comments === 1 ? "comment" : "comments"}
                </Link>
              )}

              {/* Timestamp */}
              <div
                style={{
                  padding: "0.25rem 1rem 0.75rem",
                  fontSize: "0.75rem",
                  color: colors.textSecondary,
                }}
              >
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
