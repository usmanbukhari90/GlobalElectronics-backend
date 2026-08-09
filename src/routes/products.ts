import { Router, Request, Response } from "express";
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getActiveHighlights,
  setHighlight,
  removeHighlight,
  getPopularPicks,
  getBigSavings,
  setPopularPick,
  removePopularPick,
  setPopularPickBanner,
  removePopularPickBanner,
  setBigSaving,
  removeBigSaving,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../lib/products-db.js";
import { getReviewStats } from "../lib/db.js";
import { Product } from "../types/index.js";

async function withRealReviewStats(products: Product[]): Promise<Product[]> {
  const stats = await getReviewStats();
  return products.map((p) => {
    const real = stats[p.id];
    return { ...p, rating: real?.rating ?? 0, reviewCount: real?.count ?? 0 };
  });
}

async function withRealReviewStatsSingle(product: Product): Promise<Product> {
  const stats = await getReviewStats();
  const real = stats[product.id];
  return { ...product, rating: real?.rating ?? 0, reviewCount: real?.count ?? 0 };
}
import { CATEGORIES, BRANDS } from "../types/index.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, brand, q } = req.query;
    let result = await getAllProducts();

    if (typeof q === "string" && q.trim()) {
      const query = q.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }
    if (typeof category === "string" && category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (typeof brand === "string") {
      result = result.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }

    res.json(await withRealReviewStats(result));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const all = await getAllProducts();
    const withCounts = CATEGORIES.map((cat) => ({
      ...cat,
      count: all.filter((p) => p.category === cat.id).length,
    }));
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/brands", async (_req, res) => {
  try {
    const all = await getAllProducts();
    const withCounts = BRANDS.map((b) => ({
      ...b,
      count: all.filter((p) => p.brand.toLowerCase() === b.id.toLowerCase()).length,
    }));
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});
router.get("/highlights", async (_req, res) => {
  try {
    res.json(await withRealReviewStats(await getActiveHighlights()));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch highlights" });
  }
});

router.get("/popular-picks", async (_req, res) => {
  try {
    const data = await getPopularPicks();
    res.json({
      items: await withRealReviewStats(data.items),
      banner: data.banner ? await withRealReviewStatsSingle(data.banner) : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch popular picks" });
  }
});

router.get("/big-savings", async (_req, res) => {
  try {
    res.json(await withRealReviewStats(await getBigSavings()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch big savings" });
  }
});

router.post("/:id/highlight", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { hours } = req.body;
    if (!hours || hours <= 0) return res.status(400).json({ error: "Valid duration (hours) required" });
    const product = await setHighlight(req.params.id, Number(hours));
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set highlight" });
  }
});

router.delete("/:id/highlight", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = await removeHighlight(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove highlight" });
  }
});

router.post("/:id/popular-pick", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = req.body?.asBanner ? await setPopularPickBanner(req.params.id) : await setPopularPick(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set popular pick" });
  }
});

router.delete("/:id/popular-pick", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = req.query?.banner === "true" ? await removePopularPickBanner(req.params.id) : await removePopularPick(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove popular pick" });
  }
});

router.post("/:id/big-savings", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = await setBigSaving(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set big savings" });
  }
});

router.delete("/:id/big-savings", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = await removeBigSaving(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove big savings" });
  }
});

router.get("/slug/:slug", async (req: Request<{ slug: string }>, res: Response) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(await withRealReviewStatsSingle(product));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(await withRealReviewStatsSingle(product));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});
// ── Admin-only routes below ──

router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.slug || !body.category || !body.brand || !body.price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const id = body.id || `prod-${Date.now()}`;
    const product = await createProduct({ ...body, id });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    await deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;