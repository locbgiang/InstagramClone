import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { parse as parseCookie } from "cookie";
import { verifyAccessToken } from "./lib/auth.js";
import { prisma } from "./lib/prisma.js";

let io: Server;

export function getIO(): Server {
  return io;
}

export function setupSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Auth middleware — parse accessToken cookie
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("Authentication required"));
    }

    const cookies = parseCookie(cookieHeader);
    const token = cookies.accessToken;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return next(new Error("Invalid token"));
    }

    socket.data.userId = Number(payload.userId);
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as number;

    // Join personal room for notifications / DM alerts
    socket.join(`user:${userId}`);

    // Join a conversation room
    socket.on("join_conversation", async (conversationId: number) => {
      try {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            users: { some: { id: userId } },
          },
        });
        if (conversation) {
          socket.join(`conv:${conversationId}`);
        }
      } catch (err) {
        console.error("join_conversation error:", err);
      }
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId: number) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Send a message
    socket.on(
      "send_message",
      async (data: { conversationId: number; text: string }) => {
        try {
          const { conversationId, text } = data;

          // Verify membership
          const conversation = await prisma.conversation.findFirst({
            where: {
              id: conversationId,
              users: { some: { id: userId } },
            },
          });
          if (!conversation) return;

          const message = await prisma.message.create({
            data: {
              text,
              senderId: userId,
              conversationId,
            },
            include: {
              sender: {
                select: { id: true, username: true, avatar: true },
              },
            },
          });

          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });

          io.to(`conv:${conversationId}`).emit("new_message", message);
        } catch (err) {
          console.error("send_message error:", err);
        }
      }
    );

    // Typing indicator
    socket.on("typing", (conversationId: number) => {
      socket.to(`conv:${conversationId}`).emit("user_typing", {
        userId,
        conversationId,
      });
    });

    // Mark notifications as read
    socket.on("mark_notifications_read", async () => {
      try {
        await prisma.notification.updateMany({
          where: { userId, read: false },
          data: { read: true },
        });
      } catch (err) {
        console.error("mark_notifications_read error:", err);
      }
    });
  });

  return io;
}
