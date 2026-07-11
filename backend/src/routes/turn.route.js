import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { redisRateLimiter } from "../middleware/redisRateLimiter.js";
import { generateTurnCredentials } from "../lib/turn.js";

const router = express.Router();

// Rate limit: 30 credential requests per user per minute
// (generous enough for page refreshes; tight enough to deter abuse)
const turnLimiter = redisRateLimiter({
  max: 30,
  windowSec: 60,
  keyPrefix: "rl:turn:",
  byUser: true,
});

/**
 * GET /api/turn/credentials
 *
 * Returns short-lived TURN credentials for the authenticated user.
 * Called by the frontend immediately before creating an RTCPeerConnection.
 *
 * Response shape (matches RTCIceServer):
 * {
 *   iceServers: [
 *     { urls: ["stun:stun.l.google.com:19302", ...] },      // public STUN fallback
 *     { urls: ["turn:...", ...], username: "...", credential: "..." } // coturn
 *   ]
 * }
 *
 * If TURN is not configured (TURN_SECRET / TURN_URL env missing), the endpoint
 * returns STUN-only — the call still works, just without relay fallback.
 * This keeps Render and local docker-compose working with zero changes.
 */
router.get("/credentials", protectRoute, turnLimiter, (req, res) => {
  try {
    // Always include Google's public STUN servers as the first priority
    const stunServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];

    const turnCreds = generateTurnCredentials(req.user._id.toString());

    if (!turnCreds) {
      // TURN not configured — return STUN-only (graceful degradation)
      console.warn("⚠️ TURN credentials requested but TURN_SECRET/TURN_URL not set — returning STUN only");
      return res.status(200).json({ iceServers: stunServers });
    }

    const { username, credential, urls } = turnCreds;

    return res.status(200).json({
      iceServers: [
        ...stunServers,
        { urls, username, credential },
      ],
    });
  } catch (error) {
    console.error("Error generating TURN credentials:", error);
    res.status(500).json({ message: "Failed to generate TURN credentials" });
  }
});

export default router;
