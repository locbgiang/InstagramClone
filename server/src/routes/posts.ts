import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.js";
import { getIO } from "../socket.js";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();

// Helper to build the include object for post queries
function postInclude(userId?: number) {
  return {
    user: {
      select: { id: true, username: true, name: true, avatar: true },
    },
    _count: {
      select: { likes: true, comments: true },
    },
    ...(userId
      ? { likes: { where: { userId }, select: { id: true } } }
      : {}),
  };
}

// Helper to format posts with isLiked field
function formatPost(post: any) {
  const { likes, ...rest } = post;
  return { ...rest, isLiked: Array.isArray(likes) && likes.length > 0 };
}

// POST /api/posts - Create a new post
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Image is required" });
        return;
      }

      const { caption } = req.body;
      const userId = Number(req.userId);

      const post = await prisma.post.create({
        data: {
          image: req.file.filename,
          caption: caption || null,
          userId,
        },
        include: postInclude(userId),
      });

      res.status(201).json({ post: formatPost(post) });
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/posts - Get all posts (feed)
router.get(
  "/",
  optionalAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId ? Number(req.userId) : undefined;

      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: postInclude(userId),
      });

      res.json({ posts: posts.map(formatPost) });
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/posts/user/:username - Get posts by username
router.get(
  "/user/:username",
  optionalAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { username: req.params.username as string },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const userId = req.userId ? Number(req.userId) : undefined;

      const posts = await prisma.post.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: postInclude(userId),
      });

      res.json({ posts: posts.map(formatPost) });
    } catch (error) {
      console.error("Get user posts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/posts/explore - Discover posts ordered by popularity
router.get("/explore", async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
      include: {
        user: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    res.json({ posts });
  } catch (error) {
    console.error("Get explore posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/posts/:id - Get a single post
router.get(
  "/:id",
  optionalAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId ? Number(req.userId) : undefined;

      const post = await prisma.post.findUnique({
        where: { id: Number(req.params.id) },
        include: postInclude(userId),
      });

      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      res.json({ post: formatPost(post) });
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/posts/:id/like - Toggle like
router.post(
  "/:id/like",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      const userId = Number(req.userId);

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      const existing = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        const count = await prisma.like.count({ where: { postId } });
        res.json({ liked: false, likesCount: count });
      } else {
        await prisma.like.create({ data: { userId, postId } });
        const count = await prisma.like.count({ where: { postId } });

        // Notify post owner (if not self-like)
        if (post.userId !== userId) {
          const notification = await prisma.notification.create({
            data: {
              type: "like",
              userId: post.userId,
              actorId: userId,
              postId,
            },
            include: {
              actor: { select: { id: true, username: true, avatar: true } },
              post: { select: { id: true, image: true } },
            },
          });
          getIO().to(`user:${post.userId}`).emit("new_notification", notification);
        }

        res.json({ liked: true, likesCount: count });
      }
    } catch (error) {
      console.error("Toggle like error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/posts/:id - Delete own post
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const post = await prisma.post.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      if (post.userId !== Number(req.userId)) {
        res.status(403).json({ error: "Not authorized to delete this post" });
        return;
      }

      // Delete image file from disk
      const imagePath = path.join(UPLOADS_DIR, post.image);
      fs.unlink(imagePath, () => {});

      await prisma.post.delete({ where: { id: post.id } });

      res.json({ message: "Post deleted" });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
