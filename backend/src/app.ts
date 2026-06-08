import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import formRoutes from "./routes/form.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/forms", formRoutes);

// Error middleware
app.use(errorMiddleware);

export default app;
