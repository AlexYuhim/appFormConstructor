import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app";
import connectDB from "./config/db";
import { validateEnv } from "./config/env";
import { initSocket } from "./config/socket";
import { seedAdmin } from "./config/seed";
import { createPublicRoutes } from "./routes/public.routes";

const start = async () => {
  // Validate environment variables
  const env = validateEnv();

  // Connect to MongoDB
  await connectDB();

  // Seed default admin
  await seedAdmin();

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize Socket.io
  const socketService = initSocket(httpServer);

  // Register public routes (depend on socket service)
  const publicRoutes = createPublicRoutes(socketService);
  app.use("/api/forms", publicRoutes);

  // Start server
  httpServer.listen(env.PORT, () => {
    console.log(
      `[Server] Backend running on port ${env.PORT} in ${process.env.NODE_ENV || "development"} mode`,
    );
  });
};

start().catch((error) => {
  console.error("[Server] Failed to start:", error);
  process.exit(1);
});
