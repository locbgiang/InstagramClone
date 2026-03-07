import {
  createContext,
  type ReactNode,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { API_URL, apiUrl } from "../lib/api";

export interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const socket = io(API_URL || window.location.origin, { withCredentials: true });
      socketRef.current = socket;

      socket.on("new_notification", () => {
        setUnreadCount((prev) => prev + 1);
      });

      // Fetch initial unread count
      fetch(apiUrl("/api/notifications"), { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, unreadCount, setUnreadCount }}
    >
      {children}
    </SocketContext.Provider>
  );
};
