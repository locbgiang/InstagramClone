import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { getIO } from "../socket.js";

const router = Router();

// GET /api/posts/:postId/comments - Get comments for a post
router.get(
  "/posts/:postId/comments",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = Number(req.params.postId);

      const comments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
      });

      res.json({ comments });
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/posts/:postId/comments - Add a comment
router.post(
  "/posts/:postId/comments",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = Number(req.params.postId);
      const { text } = req.body;

      if (!text || !text.trim()) {
        res.status(400).json({ error: "Comment text is required" });
        return;
      }

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      const comment = await prisma.comment.create({
        data: {
          text: text.trim(),
          userId: Number(req.userId),
          postId,
        },
        include: {
          user: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
      });

      res.status(201).json({ comment });

      // Notify post owner (if not self-comment)
      const commentUserId = Number(req.userId);
      if (post.userId !== commentUserId) {
        const notification = await prisma.notification.create({
          data: {
            type: "comment",
            userId: post.userId,
            actorId: commentUserId,
            postId,
          },
          include: {
            actor: { select: { id: true, username: true, avatar: true } },
            post: { select: { id: true, image: true } },
          },
        });
        getIO().to(`user:${post.userId}`).emit("new_notification", notification);
      }
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/comments/:id - Delete own comment
router.delete(
  "/comments/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!comment) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }

      if (comment.userId !== Number(req.userId)) {
        res.status(403).json({ error: "Not authorized to delete this comment" });
        return;
      }

      await prisma.comment.delete({ where: { id: comment.id } });

      res.json({ message: "Comment deleted" });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
