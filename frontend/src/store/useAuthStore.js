import { create } from "zustand";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  authUserId: null,

  connectSocket: (userId) => {
    const { socket } = get();

    // Don't create new connection if already connected
    if (socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId },
      withCredentials: true,
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
