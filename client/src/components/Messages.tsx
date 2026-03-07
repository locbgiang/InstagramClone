import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { apiUrl } from "../lib/api";
import { colors, inputStyle } from "../styles";
import { Avatar } from "./ui/Avatar";

interface UserInfo {
  id: number;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface MessageItem {
  id: number;
  text: string;
  createdAt: string;
  sender: { id: number; username: string; avatar: string | null };
}

interface ConversationItem {
  id: number;
  users: UserInfo[];
  messages: {
    id: number;
    text: string;
    createdAt: string;
    sender: { id: number; username: string };
  }[];
}

export const Messages = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [typingUser, setTypingUser] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/conversations"), { credentials: "include" });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(apiUrl(`/api/conversations/${selectedConvId}/messages`), {
          credentials: "include",
        });
        const data = await res.json();
        setMessages(data.messages || []);
      } catch {
        // ignore
      }
    };

    fetchMessages();

    // Join socket room
    socket?.emit("join_conversation", selectedConvId);

    return () => {
      socket?.emit("leave_conversation", selectedConvId);
    };
  }, [selectedConvId, socket]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: MessageItem) => {
      setMessages((prev) => [...prev, message]);
      // Refresh conversation list for reordering
      fetchConversations();
    };

    const handleTyping = (data: { userId: number; conversationId: number }) => {
      if (data.conversationId === selectedConvId && data.userId !== user?.id) {
        setTypingUser(data.userId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
    };
  }, [socket, selectedConvId, user?.id, fetchConversations]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || !socket) return;

    socket.emit("send_message", {
      conversationId: selectedConvId,
      text: newMessage.trim(),
    });
    setNewMessage("");
  };

  // Typing indicator
  const handleTypingInput = () => {
    if (selectedConvId && socket) {
      socket.emit("typing", selectedConvId);
    }
  };

  // Search users for new conversation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          apiUrl(`/api/search/users?q=${encodeURIComponent(searchQuery)}`),
          { credentials: "include" }
        );
        const data = await res.json();
        setSearchResults(
          (data.users || []).filter((u: UserInfo) => u.id !== user?.id)
        );
      } catch {
        // ignore
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.id]);

  // Start or open conversation with a user
  const startConversation = async (recipientId: number) => {
    try {
      const res = await fetch(apiUrl("/api/conversations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (data.conversation) {
        setSelectedConvId(data.conversation.id);
        setShowNewChat(false);
        setSearchQuery("");
        setSearchResults([]);
        fetchConversations();
      }
    } catch {
      // ignore
    }
  };

  const getOtherUser = (conv: ConversationItem): UserInfo => {
    return conv.users.find((u) => u.id !== user?.id) || conv.users[0];
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="messages-layout"
      style={{
        display: "flex",
        height: "calc(100vh - 65px)",
        maxWidth: "900px",
        margin: "0 auto",
        border: `1px solid ${colors.border}`,
        borderTop: "none",
      }}
    >
      {/* Conversations sidebar */}
      <div
        className="messages-sidebar"
        style={{
          width: "300px",
          borderRight: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: `1px solid ${colors.borderLight}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>Messages</strong>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: colors.text,
            }}
            title="New message"
          >
            +
          </button>
        </div>

        {showNewChat && (
          <div style={{ padding: "8px", borderBottom: `1px solid ${colors.borderLight}` }}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
            {searchResults.map((u) => (
              <div
                key={u.id}
                onClick={() => startConversation(u.id)}
                className="hoverable"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                <Avatar src={u.avatar} username={u.username} size={32} />
                <span style={{ fontSize: "0.9rem" }}>{u.username}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.map((conv) => {
            const other = getOtherUser(conv);
            const lastMsg = conv.messages[0];
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className="hoverable"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  cursor: "pointer",
                  background:
                    selectedConvId === conv.id ? colors.borderLight : "transparent",
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}
              >
                <Avatar src={other.avatar} username={other.username} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {other.username}
                  </div>
                  {lastMsg && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: colors.textSecondary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lastMsg.sender.id === user?.id ? "You: " : ""}
                      {lastMsg.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && !showNewChat && (
            <div
              style={{
                padding: "24px 16px",
                textAlign: "center",
                color: colors.textSecondary,
              }}
            >
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="messages-chat" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedConvId ? (
          <>
            {/* Chat header */}
            <div
              style={{
                padding: "16px",
                borderBottom: `1px solid ${colors.borderLight}`,
                fontWeight: 600,
              }}
            >
              {conversations.find((c) => c.id === selectedConvId) &&
                getOtherUser(
                  conversations.find((c) => c.id === selectedConvId)!
                ).username}
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {messages.map((msg) => {
                const isMine = msg.sender.id === user?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: isMine ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "8px 12px",
                        borderRadius: "16px",
                        background: isMine ? colors.primary : colors.borderLight,
                        color: isMine ? "#fff" : colors.text,
                      }}
                    >
                      <div>{msg.text}</div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          opacity: 0.7,
                          textAlign: "right",
                          marginTop: "2px",
                        }}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typingUser && (
                <div style={{ fontSize: "0.8rem", color: colors.textSecondary }}>
                  typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              style={{
                display: "flex",
                gap: "8px",
                padding: "12px 16px",
                borderTop: `1px solid ${colors.borderLight}`,
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTypingInput();
                }}
                placeholder="Message..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "20px",
                  outline: "none",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={!newMessage.trim()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: newMessage.trim() ? colors.primary : colors.primaryDisabled,
                  color: "#fff",
                  border: "none",
                  borderRadius: "20px",
                  cursor: newMessage.trim() ? "pointer" : "default",
                  fontWeight: 600,
                }}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.textSecondary,
              fontSize: "1.1rem",
            }}
          >
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
};
