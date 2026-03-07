import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl, uploadsUrl } from "../lib/api";
import { colors, inputStyle } from "../styles";
import { Avatar } from "./ui/Avatar";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface SearchUser {
  id: number;
  username: string;
  name: string | null;
  avatar: string | null;
  _count: { posts: number };
}

interface ExplorePost {
  id: number;
  image: string;
  caption: string | null;
  _count: { likes: number; comments: number };
}

export const Explore = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch explore posts on mount
  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        const response = await fetch(apiUrl("/api/posts/explore"));
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Failed to load explore posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchExplorePosts();
  }, []);

  // Debounced user search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setUsers([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          apiUrl(`/api/search/users?q=${encodeURIComponent(query.trim())}`)
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      {/* Search bar */}
      <div ref={searchRef} style={{ position: "relative", marginBottom: "1.5rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (users.length > 0) setShowResults(true);
          }}
          placeholder="Search users..."
          style={{
            ...inputStyle,
            backgroundColor: colors.bgSecondary,
          }}
        />

        {/* Search results dropdown */}
        {showResults && users.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              marginTop: "4px",
              maxHeight: "300px",
              overflowY: "auto",
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/${user.username}`}
                className="hoverable"
                onClick={() => {
                  setShowResults(false);
                  setQuery("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  color: colors.text,
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}
              >
                <Avatar src={user.avatar} username={user.username} size={40} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {user.username}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: "0.8rem" }}>
                    {user.name || ""}{" "}
                    {user._count.posts > 0 &&
                      `\u00B7 ${user._count.posts} ${user._count.posts === 1 ? "post" : "posts"}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showResults && query.trim() && users.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              marginTop: "4px",
              padding: "1rem",
              textAlign: "center",
              color: colors.textSecondary,
              fontSize: "0.875rem",
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            No users found.
          </div>
        )}
      </div>

      {/* Explore grid */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>
        Explore
      </h2>

      {isLoadingPosts ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <p style={{ textAlign: "center", color: colors.textSecondary }}>
          No posts to discover yet.
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
              style={{
                display: "block",
                aspectRatio: "1",
                overflow: "hidden",
                position: "relative",
              }}
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
  );
};
