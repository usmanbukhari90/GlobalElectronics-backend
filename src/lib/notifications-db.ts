import { supabase } from "./supabase.js";

export interface AdminNotification {
  id: string;
  type: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export async function createNotification(type: string, message: string, orderId?: string) {
  const { error } = await supabase.from("admin_notifications").insert({
    id: `notif-${Date.now()}`,
    type,
    message,
    order_id: orderId ?? null,
  });
  if (error) console.error("Failed to create notification:", error);
}

export async function getNotifications(): Promise<AdminNotification[]> {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    orderId: n.order_id ?? undefined,
    read: n.read,
    createdAt: n.created_at,
  }));
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from("admin_notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}

export async function markAllRead(): Promise<void> {
  const { error } = await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
  if (error) throw error;
}