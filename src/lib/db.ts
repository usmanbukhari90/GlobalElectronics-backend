import { supabase } from "./supabase.js";
import { Order, OrderStatus, Review } from "../types/index.js";

export async function getReviews(productId?: string): Promise<Review[]> {
  let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToReview);
}

export async function addReview(
  review: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  const id = `rev-${Date.now()}`;
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      id,
      product_id: review.productId,
      author: review.author,
      rating: review.rating,
      comment: review.comment,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToReview(data);
}

export async function deleteReview(id: string): Promise<boolean> {
  const { error, count } = await supabase.from("reviews").delete({ count: "exact" }).eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToOrder);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : undefined;
}

export async function createOrder(
  order: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const { data, error } = await supabase
    .from("orders")
    .insert({
      id,
      items: order.items,
      customer: order.customer,
      subtotal: order.subtotal,
      total: order.total,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToOrder(data);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : null;
}

export async function getReviewStats(): Promise<Record<string, { rating: number; count: number }>> {
  const { data, error } = await supabase.from("reviews").select("product_id, rating");
  if (error) throw error;

  const stats: Record<string, { total: number; count: number }> = {};
  (data ?? []).forEach((r) => {
    if (!stats[r.product_id]) stats[r.product_id] = { total: 0, count: 0 };
    stats[r.product_id].total += r.rating;
    stats[r.product_id].count += 1;
  });

  const result: Record<string, { rating: number; count: number }> = {};
  Object.entries(stats).forEach(([productId, { total, count }]) => {
    result[productId] = { rating: count > 0 ? Math.round((total / count) * 10) / 10 : 0, count };
  });
  return result;
}

function rowToReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    items: row.items,
    customer: row.customer,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
  };
}