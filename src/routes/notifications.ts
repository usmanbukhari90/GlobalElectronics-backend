import { Router } from "express";
import { getNotifications, getUnreadCount, markAllRead } from "../lib/notifications-db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const notifications = await getNotifications();
    res.json(notifications);
  } catch {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.get("/unread-count", requireAdmin, async (_req, res) => {
  try {
    const count = await getUnreadCount();
    res.json({ count });
  } catch {
    res.status(500).json({ error: "Failed to fetch count" });
  }
});

router.post("/mark-read", requireAdmin, async (_req, res) => {
  try {
    await markAllRead();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

export default router;