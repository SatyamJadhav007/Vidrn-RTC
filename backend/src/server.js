import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";
import { connectRedis, disconnectRedis } from "./lib/redis.js";
import { server, app } from "./lib/socket.js";

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await disconnectRedis();
  server.close(() => {
    console.log("🛑 Server closed");
    setTimeout(() => process.exit(0), 50); //sync exit after cleanup
  });
}

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://vidrn-rtc.onrender.com"
        : "http://localhost:5173",
    credentials: true, // allow frontend to send cookies
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  await connectRedis();
});
