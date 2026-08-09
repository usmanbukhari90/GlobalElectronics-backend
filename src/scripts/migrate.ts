import "dotenv/config";
import { supabase } from "../lib/supabase.js";
import { products } from "../data/products.js";

async function migrate() {
  console.log(`Migrating ${products.length} products to Supabase...`);

  const rows = products.map((p) => {
    const images = Array.from(new Set([p.image, ...(p.images ?? [])].filter(Boolean)));
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      brand: p.brand,
      price: p.price,
      original_price: p.originalPrice ?? null,
      description: p.description,
      images,
      in_stock: p.inStock,
      rating: p.rating,
      review_count: p.reviewCount,
      specs: p.specs,
      sizes: p.sizes ?? null,
      colors: p.colors ?? null,
      is_daily_highlight: p.isDailyHighlight ?? false,
      discount_percent: p.discountPercent ?? null,
    };
  });

  const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  console.log(`✔ Migrated ${rows.length} products successfully.`);
  process.exit(0);
}

migrate();