import { Router, Request, Response } from "express";
import { addReview, getReviews, deleteReview } from "../lib/db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const productId = req.query.productId as string | undefined;
  const reviews = await getReviews(productId);
  res.json(reviews);
});

router.post("/", async (req, res) => {
  try {
    const { productId, author, rating, comment } = req.body;
    if (!productId || !author || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }
    const review = await addReview({ productId, author, rating, comment });
    res.status(201).json(review);
  } catch {
    res.status(500).json({ error: "Failed to add review" });
  }
});

router.delete("/:id", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const deleted = await deleteReview(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Review not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;