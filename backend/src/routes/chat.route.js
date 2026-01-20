import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessage, getMessages, deleteMessage } from "../controllers/chat.controller.js";

const router = express.Router();

// Send a message to a user
router.post("/send/:id", protectRoute, sendMessage);

// Get all messages with a user
router.get("/:id", protectRoute, getMessages);

// Delete a message
router.delete("/:id", protectRoute, deleteMessage);

export default router;
