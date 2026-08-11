import { Router, Request, Response } from "express";
import { getHeroBanners, updateHeroBanner } from "../lib/hero-banners-db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    res.json(await getHeroBanners());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hero banners" });
  }
});

router.put("/:slot", requireAdmin, async (req: Request<{ slot: string }>, res: Response) => {
  try {
    const slot = Number(req.params.slot);
    if (slot !== 1 && slot !== 2) return res.status(400).json({ error: "Invalid slot" });
    const banner = await updateHeroBanner(slot, req.body);
    res.json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update hero banner" });
  }
});

export default router;