import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/conversations - List user's conversations
router.get(
  "/conversations",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.userId);

      const conversations = await prisma.conversation.findMany({
        where: { users: { some: { id: userId } } },
        orderBy: { updatedAt: "desc" },
        include: {
          users: {
            select: { id: true, username: true, name: true, avatar: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, username: true },
              },
            },
          },
        },
      });

      res.json({ conversations });
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/conversations - Create or get existing conversation
router.post(
  "/conversations",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.userId);
      const { recipientId } = req.body;

      if (!recipientId) {
        res.status(400).json({ error: "recipientId is required" });
        return;
      }

      const recipientIdNum = Number(recipientId);

      if (recipientIdNum === userId) {
        res.status(400).json({ error: "Cannot start conversation with yourself" });
        return;
      }

      // Check recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: recipientIdNum },
      });
      if (!recipient) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Check if conversation already exists between these two users
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { users: { some: { id: userId } } },
            { users: { some: { id: recipientIdNum } } },
          ],
        },
        include: {
          users: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
      });

      if (existing) {
        res.json({ conversation: existing });
        return;
      }

      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          users: {
            connect: [{ id: userId }, { id: recipientIdNum }],
          },
        },
        include: {
          users: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
      });

      res.status(201).json({ conversation });
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/conversations/:id/messages - Get messages for a conversation
router.get(
  "/conversations/:id/messages",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.userId);
      const conversationId = Number(req.params.id);

      // Verify membership
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          users: { some: { id: userId } },
        },
      });

      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      res.json({ messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
