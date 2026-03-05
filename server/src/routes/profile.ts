import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/profile/:username - Get a user's public profile
router.get("/:username", async (req: Request, res: Response): Promise<void> => {
  try {
    const username = req.params.username as string;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/profile - Update the logged-in user's profile
router.put(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, bio, avatar } = req.body;

      const user = await prisma.user.update({
        where: { id: Number(req.userId) },
        data: {
          ...(name !== undefined && { name }),
          ...(bio !== undefined && { bio }),
          ...(avatar !== undefined && { avatar }),
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          bio: true,
          avatar: true,
        },
      });

      res.json({ user });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
