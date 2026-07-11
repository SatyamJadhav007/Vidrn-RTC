import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import express from "express";
import { getCorsOrigins } from "./corsOrigins.js";
import { createRedisDuplicateClient, redis } from "./redis.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
  },
});

const ONLINE_USERS_KEY = "online_users";

let pubClient = null;
let subClient = null;

function userRoom(userId) {
  return `user:${userId}`;
}

export async function initSocketAdapter() {
  pubClient = createRedisDuplicateClient();
  subClient = pubClient.duplicate();

  pubClient.on("error", (err) =>
    console.error("❌ Socket.IO Redis pub error:", err.message),
  );
  subClient.on("error", (err) =>
    console.error("❌ Socket.IO Redis sub error:", err.message),
  );

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log("✅ Socket.IO Redis adapter connected");
}

export async function disconnectSocketAdapter() {
  if (subClient?.isOpen) {
    await subClient.quit();
  }
  if (pubClient?.isOpen) {
    await pubClient.quit();
  }
}

export function emitToUser(userId, event, payload) {
  io.to(userRoom(userId)).emit(event, payload);
}

async function isUserOnline(userId) {
  const sockets = await io.in(userRoom(userId)).fetchSockets();
  return sockets.length > 0;
}

async function broadcastOnlineUsers() {
  try {
    const users = await redis.sMembers(ONLINE_USERS_KEY);
    io.emit("getOnlineUsers", users);
  } catch (error) {
    console.error("❌ Failed to broadcast online users:", error.message);
  }
}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  socket.on("call-user", async ({ to, from, signal }) => {
    if (await isUserOnline(to)) {
      console.log(`📞 Calling user ${to} from ${from}`);
      emitToUser(to, "incoming-call", { from, signal });
    } else {
      console.warn(`⚠️ User ${to} is offline or not found.`);
      socket.emit("call-error", { message: "User is offline" });
    }
  });

  socket.on("answer-call", ({ to, signal }) => {
    console.log(`✅ Call answered by ${userId} for ${to}`);
    emitToUser(to, "call-answered", { signal });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    console.log(`❄️ Sending ICE candidate from ${userId} to ${to}`);
    emitToUser(to, "ice-candidate", { candidate, from: userId });
  });

  socket.on("end-call", ({ to }) => {
    console.log(`🚫 Call ended by ${userId} for ${to}`);
    emitToUser(to, "call-ended");
  });

  socket.on("disconnect", async () => {
    if (!userId) return;

    console.log(`❌ User disconnected: ${userId}`);

    const remaining = await io.in(userRoom(userId)).fetchSockets();
    if (remaining.length === 0) {
      try {
        await redis.sRem(ONLINE_USERS_KEY, userId);
      } catch (error) {
        console.error(
          "❌ Failed to update online users on disconnect:",
          error.message,
        );
      }
    }

    await broadcastOnlineUsers();
  });

  if (!userId) return;

  try {
    await socket.join(userRoom(userId));
    await redis.sAdd(ONLINE_USERS_KEY, userId);
    console.log(`✅ User connected: ${userId} -> Socket ID: ${socket.id}`);
    await broadcastOnlineUsers();
  } catch (error) {
    console.error("❌ Failed to register online user:", error.message);
  }
});

export { io, app, server };
