import { create } from "zustand";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  (import.meta.env.MODE === "development" ? "http://localhost:5001" : "/");

// Polling breaks behind a load balancer without sticky sessions (initial GET/POST
// can land on different backends). WebSocket-only is safe with the Redis adapter.
const SOCKET_TRANSPORTS =
  import.meta.env.MODE === "development"
    ? ["polling", "websocket"]
    : ["websocket"];

export const useAuthStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  authUserId: null,

  connectSocket: (userId) => {
    const { socket } = get();

    if (socket?.connected) return;

    // Drop a stale socket so reconnects after proxy/adapter errors get a clean client
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    const newSocket = io(SOCKET_URL, {
      query: { userId },
      withCredentials: true,
      path: "/socket.io",
      transports: SOCKET_TRANSPORTS,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    set({ socket: newSocket, authUserId: userId });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
      console.log("❌ Socket disconnected");
    }
  },

  //Used in FriendCard to display the other friend's online status
  isUserOnline: (userId) => {
    const { onlineUsers } = get();
    return onlineUsers.includes(userId);
  },
}));
