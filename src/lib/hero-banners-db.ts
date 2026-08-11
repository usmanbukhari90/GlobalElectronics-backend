import { supabase } from "./supabase.js";
import { HeroBanner } from "../types/index.js";

interface Row {
  slot: number;
  heading: string;
  subheading: string | null;
  button_text: string;
  link_href: string;
  image_url: string;
}

function rowToBanner(row: Row): HeroBanner {
  return {
    slot: row.slot as 1 | 2,
    heading: row.heading,
    subheading: row.subheading ?? undefined,
    buttonText: row.button_text,
    linkHref: row.link_href,
    imageUrl: row.image_url,
  };
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const { data, error } = await supabase.from("hero_banners").select("*").order("slot");
  if (error) throw error;
  return (data as Row[]).map(rowToBanner);
}

export async function updateHeroBanner(slot: 1 | 2, banner: Partial<HeroBanner>): Promise<HeroBanner> {
  const row: Record<string, unknown> = {};
  if (banner.heading !== undefined) row.heading = banner.heading;
  if (banner.subheading !== undefined) row.subheading = banner.subheading || null;
  if (banner.buttonText !== undefined) row.button_text = banner.buttonText;
  if (banner.linkHref !== undefined) row.link_href = banner.linkHref;
  if (banner.imageUrl !== undefined) row.image_url = banner.imageUrl;

  const { data, error } = await supabase
    .from("hero_banners")
    .update(row)
    .eq("slot", slot)
    .select()
    .single();
  if (error) throw error;
  return rowToBanner(data as Row);
}