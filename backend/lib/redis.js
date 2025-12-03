import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Create Redis client
export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    console.log(`🔁 Redis reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
});

// Log when Redis connects successfully
redis.on("connect", () => {
  console.log("✅ Redis connection established successfully");
});

// Log when Redis is ready to receive commands
redis.on("ready", () => {
  console.log("🚀 Redis is ready for commands");
});

// Handle errors
redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

// Log when Redis disconnects
redis.on("end", () => {
  console.warn("⚠️ Redis connection closed");
});

// Optionally, confirm connection works on startup
(async () => {
  try {
    await redis.ping();
    console.log("🏓 Redis ping successful — connection is healthy");
  } catch (err) {
    console.error("🚫 Redis ping failed:", err.message);
  }
})();
