import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications - Get user's notifications
router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.userId);

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          actor: {
            select: { id: true, username: true, avatar: true },
          },
          post: {
            select: { id: true, image: true },
          },
        },
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, read: false },
      });

      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/notifications/read - Mark all notifications as read
router.put(
  "/read",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.userId);

      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      res.json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("Mark notifications read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
