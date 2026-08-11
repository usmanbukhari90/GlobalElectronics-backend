import { supabase } from "./supabase.js";
import { AnnouncementMessage } from "../types/index.js";

interface Row {
  id: string;
  text: string;
  display_order: number;
}

function rowToMessage(row: Row): AnnouncementMessage {
  return { id: row.id, text: row.text, displayOrder: row.display_order };
}

export async function getAnnouncements(): Promise<AnnouncementMessage[]> {
  const { data, error } = await supabase.from("announcement_messages").select("*").order("display_order");
  if (error) throw error;
  return (data as Row[]).map(rowToMessage);
}

export async function createAnnouncement(text: string): Promise<AnnouncementMessage> {
  const { data: existing } = await supabase
    .from("announcement_messages")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = existing ? existing.display_order + 1 : 1;

  const { data, error } = await supabase
    .from("announcement_messages")
    .insert({ id: `msg-${Date.now()}`, text, display_order: nextOrder })
    .select()
    .single();
  if (error) throw error;
  return rowToMessage(data as Row);
}

export async function updateAnnouncement(id: string, text: string): Promise<AnnouncementMessage> {
  const { data, error } = await supabase
    .from("announcement_messages")
    .update({ text })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToMessage(data as Row);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from("announcement_messages").delete().eq("id", id);
  if (error) throw error;
}