import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/search/users?q=term - Search users by username or name
router.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string || "").trim();

    if (!q) {
      res.json({ users: [] });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        _count: { select: { posts: true } },
      },
      take: 20,
    });

    res.json({ users });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
