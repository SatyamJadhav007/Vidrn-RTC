import { createClient } from "redis";

// Create Redis client (rediss:// handles TLS automatically)
const redis = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("❌ Redis max reconnection attempts reached");
        return new Error("Max reconnection attempts reached");
      }
      const delay = Math.min(retries * 100, 3000); // Exponential backoff, max 3s
      console.log(`🔄 Redis reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    },
  },
});

redis.on("error", (err) => console.error("❌ Redis Error:", err.message));
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("end", () => console.log("🔌 Redis disconnected"));

/**
 * Connect to Redis (call once at server startup)
 */
export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

/**
 * Gracefully disconnect from Redis
 */
export async function disconnectRedis() {
  if (redis.isOpen) {
    await redis.quit();
  }
}

/**
 * Get cached value by key
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Parsed value or null if not found
 */
export async function getFromCache(key) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`🔵 CACHE HIT: ${key}`);
      return JSON.parse(cached);
    }
    console.log(`🟡 CACHE MISS: ${key}`);
    return null;
  } catch (error) {
    console.error("Redis getFromCache error:", error.message);
    return null;
  }
}

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttlSeconds - Time to live in seconds
 */
export async function setInCache(key, value, ttlSeconds) {
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
    console.log(`🟢 CACHE SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error("Redis setInCache error:", error.message);
  }
}

/**
 * Invalidate (delete) one or more cache keys
 * @param {...string} keys - Keys to delete
 */
export async function invalidateCache(...keys) {
  try {
    if (keys.length === 0) return;
    const result = await redis.del(keys);
    console.log(
      `🔴 CACHE INVALIDATED: ${keys.join(", ")} (${result} keys deleted)`,
    );
  } catch (error) {
    console.error("Redis invalidateCache error:", error.message);
  }
}

export { redis };
