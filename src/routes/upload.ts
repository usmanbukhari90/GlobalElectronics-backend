import { Router } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.post("/", requireAdmin, upload.array("images", 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) return res.status(400).json({ error: "No files uploaded" });

    const urls: string[] = [];
    for (const file of files) {
      const ext = file.originalname.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(filename, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
      urls.push(data.publicUrl);
    }
    res.json({ urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;