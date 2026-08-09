import { supabase } from "./supabase.js";
import { Product } from "../types/index.js";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  original_price: number | null;
  description: string;
  images: string[];
  in_stock: boolean;
  rating: number;
  review_count: number;
  specs: Record<string, string>;
  sizes: Product["sizes"] | null;
  colors: string[] | null;
  color_swatches: Product["colorSwatches"] | null;
  is_daily_highlight: boolean;
  discount_percent: number | null;
  highlight_expires_at: string | null;
  is_popular_pick: boolean;
  is_popular_pick_banner: boolean;
  is_big_savings: boolean;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category as Product["category"],
    brand: row.brand,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    description: row.description,
    image: row.images?.[0] ?? "",
    images: row.images ?? [],
    inStock: row.in_stock,
    rating: row.rating,
    reviewCount: row.review_count,
    specs: row.specs ?? {},
    sizes: row.sizes ?? undefined,
    colors: row.colors ?? undefined,
    colorSwatches: row.color_swatches ?? undefined,
    isDailyHighlight: row.is_daily_highlight,
    discountPercent: row.discount_percent ?? undefined,
    highlightExpiresAt: row.highlight_expires_at ?? undefined,
    isPopularPick: row.is_popular_pick,
    isPopularPickBanner: row.is_popular_pick_banner,
    isBigSavings: row.is_big_savings,
  };
}

function productToRow(p: Partial<Product>) {
  const row: Record<string, unknown> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.name !== undefined) row.name = p.name;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.category !== undefined) row.category = p.category;
  if (p.brand !== undefined) row.brand = p.brand;
  if (p.price !== undefined) row.price = p.price;
  if (p.originalPrice !== undefined) row.original_price = p.originalPrice;
  if (p.description !== undefined) row.description = p.description;
  if (p.images !== undefined) row.images = p.images;
  if (p.inStock !== undefined) row.in_stock = p.inStock;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.reviewCount !== undefined) row.review_count = p.reviewCount;
  if (p.specs !== undefined) row.specs = p.specs;
  if (p.sizes !== undefined) row.sizes = p.sizes;
  if (p.colors !== undefined) row.colors = p.colors;
  if (p.colorSwatches !== undefined) row.color_swatches = p.colorSwatches;
  if (p.isDailyHighlight !== undefined) row.is_daily_highlight = p.isDailyHighlight;
  if (p.discountPercent !== undefined) row.discount_percent = p.discountPercent;
  return row;
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function getActiveHighlights(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_daily_highlight", true)
    .gt("highlight_expires_at", new Date().toISOString())
    .order("highlight_expires_at", { ascending: true });
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

export async function setHighlight(id: string, hours: number): Promise<Product> {
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("products")
    .update({ is_daily_highlight: true, highlight_expires_at: expiresAt })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function removeHighlight(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({ is_daily_highlight: false, highlight_expires_at: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}


export async function createProduct(p: Product): Promise<Product> {
  const row = productToRow(p);
  const { data, error } = await supabase.from("products").insert(row).select().single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(id: string, p: Partial<Product>): Promise<Product> {
  const row = productToRow(p);
  const { data, error } = await supabase.from("products").update(row).eq("id", id).select().single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
export async function getPopularPicks(): Promise<{ items: Product[]; banner: Product | null }> {
  const { data: items, error: e1 } = await supabase
    .from("products")
    .select("*")
    .eq("is_popular_pick", true)
    .order("display_order", { ascending: true })
    .limit(4);
  if (e1) throw e1;

  const { data: banner } = await supabase
    .from("products")
    .select("*")
    .eq("is_popular_pick_banner", true)
    .limit(1)
    .maybeSingle();

  return {
    items: (items as ProductRow[]).map(rowToProduct),
    banner: banner ? rowToProduct(banner as ProductRow) : null,
  };
}

export async function getBigSavings(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_big_savings", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

export async function setPopularPick(id: string): Promise<Product> {
  const { data, error } = await supabase.from("products").update({ is_popular_pick: true }).eq("id", id).select().single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function removePopularPick(id: string): Promise<Product> {
  const { data, error } = await supabase.from("products").update({ is_popular_pick: false }).eq("id", id).select().single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function setPopularPickBanner(id: string): Promise<Product> {
  await supabase.from("products").update({ is_popular_pick_banner: false }).eq("is_popular_pick_banner", true);
  const { data, error } = await supabase
    .from("products")
    .update({ is_popular_pick_banner: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function removePopularPickBanner(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({ is_popular_pick_banner: false })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function setBigSaving(id: string): Promise<Product> {
  const { data, error } = await supabase.from("products").update({ is_big_savings: true }).eq("id", id).select().single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function removeBigSaving(id: string): Promise<Product> {
  const { data, error } = await supabase.from("products").update({ is_big_savings: false }).eq("id", id).select().single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}