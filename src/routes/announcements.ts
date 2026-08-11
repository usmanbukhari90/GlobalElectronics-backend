import { Router, Request, Response } from "express";
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../lib/announcements-db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    res.json(await getAnnouncements());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Text is required" });
    const message = await createAnnouncement(text.trim());
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

router.put("/:id", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Text is required" });
    const message = await updateAnnouncement(req.params.id, text.trim());
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

router.delete("/:id", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    await deleteAnnouncement(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;