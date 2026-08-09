import "dotenv/config";
import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import reviewsRouter from "./routes/reviews.js";
import authRouter from "./routes/auth.js";
import uploadRouter from "./routes/upload.js";
import analyticsRouter from "./routes/analytics.js";  
import notificationsRouter from "./routes/notifications.js";
const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/notifications", notificationsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
