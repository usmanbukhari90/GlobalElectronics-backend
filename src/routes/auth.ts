import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const JWT_SECRET = process.env.JWT_SECRET ?? "";

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // Plain comparison against .env values — fine for a single hardcoded admin account.
  // If you later add multiple admin users, switch to bcrypt.compare against hashed passwords in a table.
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, email });
});

router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ valid: false });
  }
  try {
    jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

export default router;