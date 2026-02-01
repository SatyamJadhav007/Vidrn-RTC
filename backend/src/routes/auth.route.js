import express from "express";
import { login, logout, onboard, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { redisRateLimiter } from "../middleware/redisRateLimiter.js";

const router = express.Router();

// Rate limiters for auth routes (by IP)
const signupLimiter = redisRateLimiter({ max: 3, windowSec: 60, keyPrefix: "rl:signup:" });
const loginLimiter = redisRateLimiter({ max: 5, windowSec: 60, keyPrefix: "rl:login:" });
const onboardLimiter = redisRateLimiter({ max: 10, windowSec: 60, keyPrefix: "rl:onboard:", byUser: true });

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboardLimiter, onboard);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
