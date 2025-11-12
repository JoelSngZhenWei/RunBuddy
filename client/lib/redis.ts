import { Redis } from "@upstash/redis";

// Redis configuration for Strava activity caching
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Make Redis optional - if not configured, caching will be disabled
let redis: Redis | null = null;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
  console.log("✓ Redis caching enabled");
} else {
  console.warn(
    "⚠️  Redis not configured - caching disabled. " +
      "To enable caching, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. " +
      "Get these from: https://console.upstash.com/"
  );
}

export { redis };
