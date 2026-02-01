import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { redisRateLimiter } from "../middleware/redisRateLimiter.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  getUserById,
} from "../controllers/user.controller.js";

const router = express.Router();

// Rate limiters for user routes (by user ID)
const readLimiter = redisRateLimiter({ max: 30, windowSec: 60, keyPrefix: "rl:user-read:", byUser: true });
const friendReqLimiter = redisRateLimiter({ max: 10, windowSec: 60, keyPrefix: "rl:friend-req:", byUser: true });

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", readLimiter, getRecommendedUsers);
router.get("/friends", readLimiter, getMyFriends);

router.post("/friend-request/:id", friendReqLimiter, sendFriendRequest);
router.put("/friend-request/:id/accept", friendReqLimiter, acceptFriendRequest);

router.get("/friend-requests", readLimiter, getFriendRequests);
router.get("/outgoing-friend-requests", readLimiter, getOutgoingFriendReqs);

// Get user by ID
router.get("/:id", getUserById);

export default router;
