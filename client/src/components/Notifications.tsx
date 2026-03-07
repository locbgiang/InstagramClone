import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { apiUrl, uploadsUrl } from "../lib/api";
import { colors } from "../styles";
import { Avatar } from "./ui/Avatar";

interface NotificationItem {
  id: number;
  type: "like" | "comment";
  read: boolean;
  createdAt: string;
  actor: { id: number; username: string; avatar: string | null };
  post: { id: number; image: string };
}

export const Notifications = () => {
  const { unreadCount, setUnreadCount } = useSocket();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen) {
      // Fetch notifications
      try {
        const res = await fetch(apiUrl("/api/notifications"), {
          credentials: "include",
        });
        const data = await res.json();
        setNotifications(data.notifications || []);

        // Mark as read
        if (data.unreadCount > 0) {
          await fetch(apiUrl("/api/notifications/read"), {
            method: "PUT",
            credentials: "include",
          });
          setUnreadCount(0);
        }
      } catch {
        // ignore
      }
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={handleToggle}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.3rem",
          position: "relative",
          padding: "4px",
          color: colors.text,
        }}
        title="Notifications"
      >
        &#9829;
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-6px",
              background: colors.error,
              color: "#fff",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            width: "320px",
            maxHeight: "400px",
            overflowY: "auto",
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${colors.borderLight}`,
              fontWeight: 600,
            }}
          >
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div
              style={{ padding: "24px 16px", textAlign: "center", color: colors.textSecondary }}
            >
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                to={`/post/${n.post.id}`}
                onClick={() => setOpen(false)}
                className="hoverable"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  textDecoration: "none",
                  color: colors.text,
                  background: n.read ? "transparent" : "#f0f8ff",
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}
              >
                <Avatar src={n.actor.avatar} username={n.actor.username} size={36} />
                <div style={{ flex: 1, fontSize: "0.9rem" }}>
                  <strong>{n.actor.username}</strong>{" "}
                  {n.type === "like"
                    ? "liked your post"
                    : "commented on your post"}
                  <div style={{ color: colors.textSecondary, fontSize: "0.8rem" }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
                <img
                  src={uploadsUrl(n.post.image)}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};
