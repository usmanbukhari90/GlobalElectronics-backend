import { Router, Request, Response } from "express";
import { createOrder, getOrders, getOrderById } from "../lib/db.js";
import { requireAdmin } from "../middleware/auth.js";
import { sendOrderPlacedEmail, sendOrderStatusEmail } from "../lib/email.js";
import { createNotification } from "../lib/notifications-db.js";

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  const orders = await getOrders();
  res.json(orders);
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const order = await getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

router.post("/", async (req, res) => {
  try {
    const { items, customer, subtotal, total } = req.body;
    if (!items?.length || !customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const order = await createOrder({ items, customer, subtotal, total });

    sendOrderPlacedEmail(order).catch((err) => console.error("Email failed:", err));
    createNotification("new_order", `New order from ${customer.name} — ${total.toFixed(2)} د.إ`, order.id).catch(
      (err) => console.error("Notification failed:", err)
    );

    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.patch("/:id/status", requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "confirmed", "shipped", "delivered"];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const { updateOrderStatus } = await import("../lib/db.js");
    const updated = await updateOrderStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Order not found" });

    sendOrderStatusEmail(updated).catch((err) => console.error("Email failed:", err));

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;