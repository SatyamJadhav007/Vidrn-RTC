import { redis } from "../lib/redis.js";

/**
 * Redis-based rate limiter middleware factory using fixed window counter (INCR + EXPIRE).
 *
 * @param {Object} options - Configuration options
 * @param {number} options.max - Maximum requests allowed in the window
 * @param {number} options.windowSec - Window duration in seconds
 * @param {string} options.keyPrefix - Redis key prefix (e.g., "rl:login:")
 * @param {boolean} [options.byUser=false] - If true, rate limit by req.user._id; otherwise by IP
 * @returns {Function} Express middleware
 */
export function redisRateLimiter({ max, windowSec, keyPrefix, byUser = false }) {
  return async (req, res, next) => {
    try {
      // Determine the identifier (IP or user ID)
      let identifier;
      if (byUser) {
        if (!req.user?._id) {
          // If byUser is true but no user, skip rate limiting (auth middleware should handle this)
          console.warn("⚠️ Rate limiter (byUser): req.user._id not found, skipping");
          return next();
        }
        identifier = req.user._id.toString();
      } else {
        // Use X-Forwarded-For for proxied requests, fallback to req.ip
        identifier = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
      }

      const key = `${keyPrefix}${identifier}`;

      // Check if Redis is connected
      if (!redis.isOpen) {
        console.warn("⚠️ Rate limiter: Redis not connected, failing open");
        return next();
      }

      // Increment the counter
      const currentCount = await redis.incr(key);

      // If this is the first request in the window, set the expiry
      if (currentCount === 1) {
        await redis.expire(key, windowSec);
      }

      // Get TTL for the Reset header
      const ttl = await redis.ttl(key);
      const resetTime = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : windowSec);

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - currentCount));
      res.setHeader("X-RateLimit-Reset", resetTime);

      // Check if limit exceeded
      if (currentCount > max) {
        res.setHeader("Retry-After", ttl > 0 ? ttl : windowSec);
        return res.status(429).json({
          success: false,
          message: "Too many requests, please try again later",
          retryAfter: ttl > 0 ? ttl : windowSec,
        });
      }

      next();
    } catch (error) {
      // Fail open: if Redis errors, log and continue
      console.error("❌ Rate limiter error (failing open):", error.message);
      next();
    }
  };
}
