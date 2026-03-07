import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiUrl, uploadsUrl } from "../lib/api";
import { colors } from "../styles";
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

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: PostUser;
}

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(apiUrl(`/api/posts/${id}`), { credentials: "include" }),
          fetch(apiUrl(`/api/posts/${id}/comments`)),
        ]);

        if (!postRes.ok) {
          throw new Error("Post not found");
        }

        const postData = await postRes.json();
        setPost(postData.post);

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData.comments);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl(`/api/posts/${id}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete post");
      }

      navigate(`/${post?.user.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
      setIsDeleting(false);
    }
  };

  const toggleLike = async () => {
    if (!post) return;
    try {
      const response = await fetch(apiUrl(`/api/posts/${id}/like`), {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPost({
          ...post,
          isLiked: data.liked,
          _count: { ...post._count, likes: data.likesCount },
        });
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(apiUrl(`/api/posts/${id}/comments`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
        if (post) {
          setPost({
            ...post,
            _count: { ...post._count, comments: post._count.comments + 1 },
          });
        }
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(apiUrl(`/api/comments/${commentId}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        if (post) {
          setPost({
            ...post,
            _count: { ...post._count, comments: post._count.comments - 1 },
          });
        }
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !post) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: colors.error }}>
        {error || "Post not found"}
      </div>
    );
  }

  const isOwnPost = currentUser?.id === post.user.id;

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
      <div
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
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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

          {isOwnPost && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                padding: "0.4rem 0.75rem",
                backgroundColor: "transparent",
                color: colors.error,
                border: `1px solid ${colors.error}`,
                borderRadius: "6px",
                cursor: isDeleting ? "default" : "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>

        {/* Post image */}
        <img
          src={uploadsUrl(post.image)}
          alt={post.caption || "Post"}
          style={{ width: "100%", display: "block" }}
        />

        {/* Actions */}
        <div style={{ padding: "0.5rem 1rem" }}>
          {isAuthenticated && (
            <button
              onClick={toggleLike}
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

        {/* Comments section */}
        <div style={{ borderTop: `1px solid ${colors.borderLight}` }}>
          {comments.length > 0 && (
            <div style={{ padding: "0.75rem 1rem" }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Link
                      to={`/${comment.user.username}`}
                      style={{
                        fontWeight: 600,
                        color: colors.text,
                        marginRight: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      {comment.user.username}
                    </Link>
                    <span style={{ fontSize: "0.875rem" }}>{comment.text}</span>
                  </div>
                  {currentUser?.id === comment.user.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: colors.textSecondary,
                        fontSize: "0.75rem",
                        padding: "0 0 0 0.5rem",
                        flexShrink: 0,
                      }}
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add comment form */}
          {isAuthenticated && (
            <form
              onSubmit={handleAddComment}
              style={{
                display: "flex",
                borderTop: `1px solid ${colors.borderLight}`,
                padding: "0.5rem 1rem",
                gap: "0.5rem",
              }}
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                style={{
                  background: "none",
                  border: "none",
                  color: commentText.trim() ? colors.primary : colors.primaryDisabled,
                  fontWeight: 600,
                  cursor: commentText.trim() ? "pointer" : "default",
                  fontSize: "0.875rem",
                }}
              >
                Post
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
