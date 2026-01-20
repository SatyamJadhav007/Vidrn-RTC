import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  selectedUser: null,
  isMessagesLoading: false,

  //Load all messages if the user was not selected/offline
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/chat/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  //Get the selected user and the message then call the send api point and trigger the socket event init.
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(
        `/chat/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  //Update the messages state for the sender side then call the delete api point and trigger the socket event
  deleteMessage: async (messageId) => {
    const { messages } = get();
    try {
      await axiosInstance.delete(`/chat/${messageId}`);
      set({ messages: messages.filter((msg) => msg._id !== messageId) });
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  //If the user is online then handle the incoming message and message delete events
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      // Only add message if it's from the selected user
      const isMessageSentFromSelectedUser =
        newMessage.from === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({ messages: [...get().messages, newMessage] });
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set({ messages: get().messages.filter((msg) => msg._id !== messageId) });
    });
  },

  //remove the socket event listeners once the user goes offline or deselects the user chat.
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageDeleted");
  },
  //the update the selected user and the clean up the messages state from the store
  setSelectedUser: (user) => set({ selectedUser: user }),

  clearMessages: () => set({ messages: [], selectedUser: null }),
}));
