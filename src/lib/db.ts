import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Order, Review } from "../types/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export async function getReviews(productId?: string): Promise<Review[]> {
  const reviews = await readJson<Review[]>("reviews.json", []);
  return productId ? reviews.filter((r) => r.productId === productId) : reviews;
}

export async function addReview(
  review: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  const reviews = await getReviews();
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  reviews.unshift(newReview);
  await writeJson("reviews.json", reviews);
  return newReview;
}

export async function deleteReview(id: string): Promise<boolean> {
  const reviews = await readJson<Review[]>("reviews.json", []);
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) return false;
  await writeJson("reviews.json", filtered);
  return true;
}

export async function getOrders(): Promise<Order[]> {
  return readJson<Order[]>("orders.json", []);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.id === id);
}
export async function createOrder(
  order: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  const orders = await getOrders();
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  await writeJson("orders.json", orders);
  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order | null> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], status };
  await writeJson("orders.json", orders);
  return orders[index];
}
export async function getReviewStats(): Promise<Record<string, { rating: number; count: number }>> {
  const reviews = await readJson<Review[]>("reviews.json", []);
  const stats: Record<string, { total: number; count: number }> = {};

  reviews.forEach((r) => {
    if (!stats[r.productId]) stats[r.productId] = { total: 0, count: 0 };
    stats[r.productId].total += r.rating;
    stats[r.productId].count += 1;
  });

  const result: Record<string, { rating: number; count: number }> = {};
  Object.entries(stats).forEach(([productId, { total, count }]) => {
    result[productId] = { rating: count > 0 ? Math.round((total / count) * 10) / 10 : 0, count };
  });
  return result;
}