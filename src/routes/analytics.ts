import { Router } from "express";
import { getOrders } from "../lib/db.js";
import { getAllProducts } from "../lib/products-db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const orders = await getOrders();
    const products = await getAllProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
    const shippedCount = orders.filter((o) => o.status === "shipped").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;

    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      ordersByStatus: {
        pending: pendingCount,
        confirmed: confirmedCount,
        shipped: shippedCount,
        delivered: deliveredCount,
      },
      topProducts,
      recentOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;