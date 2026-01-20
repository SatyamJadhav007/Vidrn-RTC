import { Message } from "../models/message.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Send a message to another user
export async function sendMessage(req, res) {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const newMessage = await Message.create({
      from: senderId,
      to: receiverId,
      text: text.trim(),
    });

    // Emit to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all messages between current user and another user
export async function getMessages(req, res) {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { from: myId, to: otherUserId },
        { from: otherUserId, to: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete a message
export async function deleteMessage(req, res) {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only the sender can delete their message
    if (message.from.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    // Notify the other user about the deleted message
    const receiverId = message.to.toString();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
