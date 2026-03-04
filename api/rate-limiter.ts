import type { VercelRequest } from "@vercel/node";
import { Redis } from "@upstash/redis";

// Check if Redis is configured
const hasRedisConfig = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Upstash Redis client only if credentials are available
const redis = hasRedisConfig ? Redis.fromEnv() : null;

interface RateLimitEntry {
  hourlyCount: number;
  dailyCount: number;
  hourlyResetTime: number;
  dailyResetTime: number;
}

interface GlobalLimitEntry {
  count: number;
  resetTime: number;
}

// Configuration
export const RATE_LIMITS = {
  PER_IP_HOURLY: 10,
  PER_IP_DAILY: 30,
  GLOBAL_DAILY: 300,
};

export interface RateLimitResult {
  allowed: boolean;
  limitType?: "hourly" | "daily" | "global";
  hourlyRemaining: number;
  dailyRemaining: number;
  resetTime: number;
  resetMinutes: number;
}

/**
 * Check if request is allowed based on rate limits
 */
export async function checkRateLimit(req: VercelRequest): Promise<RateLimitResult> {
  // If Redis is not configured (local development), allow all requests
  if (!redis) {
    console.log("⚠️  Rate limiting disabled (Redis not configured)");
    return {
      allowed: true,
      hourlyRemaining: RATE_LIMITS.PER_IP_HOURLY,
      dailyRemaining: RATE_LIMITS.PER_IP_DAILY,
      resetTime: Date.now() + 60 * 60 * 1000,
      resetMinutes: 60,
    };
  }

  const ip = getClientIP(req);
  const now = Date.now();

  // Check global daily limit first
  const globalKey = "rate_limit:global";
  let globalStore = await redis.get<GlobalLimitEntry>(globalKey);

  if (!globalStore || globalStore.resetTime < now) {
    // Reset global counter
    globalStore = {
      count: 0,
      resetTime: getNextMidnight(),
    };
    await redis.set(globalKey, globalStore, {
      exat: Math.floor(globalStore.resetTime / 1000), // Expire at midnight
    });
  }

  if (globalStore.count >= RATE_LIMITS.GLOBAL_DAILY) {
    return {
      allowed: false,
      limitType: "global",
      hourlyRemaining: 0,
      dailyRemaining: 0,
      resetTime: globalStore.resetTime,
      resetMinutes: Math.ceil((globalStore.resetTime - now) / 1000 / 60),
    };
  }

  // Get or create IP entry
  const ipKey = `rate_limit:ip:${ip}`;
  let entry = await redis.get<RateLimitEntry>(ipKey);

  if (!entry) {
    entry = {
      hourlyCount: 0,
      dailyCount: 0,
      hourlyResetTime: now + 60 * 60 * 1000, // 1 hour
      dailyResetTime: getNextMidnight(),
    };
  }

  // Reset hourly counter if expired
  if (entry.hourlyResetTime < now) {
    entry.hourlyCount = 0;
    entry.hourlyResetTime = now + 60 * 60 * 1000;
  }

  // Reset daily counter if expired
  if (entry.dailyResetTime < now) {
    entry.dailyCount = 0;
    entry.dailyResetTime = getNextMidnight();
  }

  // Check hourly limit
  if (entry.hourlyCount >= RATE_LIMITS.PER_IP_HOURLY) {
    return {
      allowed: false,
      limitType: "hourly",
      hourlyRemaining: 0,
      dailyRemaining: Math.max(0, RATE_LIMITS.PER_IP_DAILY - entry.dailyCount),
      resetTime: entry.hourlyResetTime,
      resetMinutes: Math.ceil((entry.hourlyResetTime - now) / 1000 / 60),
    };
  }

  // Check daily limit
  if (entry.dailyCount >= RATE_LIMITS.PER_IP_DAILY) {
    return {
      allowed: false,
      limitType: "daily",
      hourlyRemaining: 0,
      dailyRemaining: 0,
      resetTime: entry.dailyResetTime,
      resetMinutes: Math.ceil((entry.dailyResetTime - now) / 1000 / 60),
    };
  }

  // Increment counters
  entry.hourlyCount++;
  entry.dailyCount++;

  // Save updated IP entry with TTL (automatically cleanup after daily reset)
  const ttlSeconds = Math.ceil((entry.dailyResetTime - now) / 1000);
  await redis.set(ipKey, entry, { ex: ttlSeconds });

  // Increment global counter
  globalStore.count++;
  await redis.set(globalKey, globalStore, {
    exat: Math.floor(globalStore.resetTime / 1000),
  });

  return {
    allowed: true,
    hourlyRemaining: RATE_LIMITS.PER_IP_HOURLY - entry.hourlyCount,
    dailyRemaining: RATE_LIMITS.PER_IP_DAILY - entry.dailyCount,
    resetTime: entry.hourlyResetTime,
    resetMinutes: Math.ceil((entry.hourlyResetTime - now) / 1000 / 60),
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(req: VercelRequest): string {
  // Try various headers that Vercel provides
  const forwarded = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];

  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0].trim();
    return ip;
  }

  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  return req.socket?.remoteAddress || "unknown";
}

/**
 * Get next midnight timestamp (for daily reset)
 */
function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Format time remaining in a friendly way
 */
export function formatResetTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
}

/**
 * Get user-friendly error message for rate limit
 */
export function getRateLimitMessage(result: RateLimitResult): string {
  const timeStr = formatResetTime(result.resetMinutes);

  if (result.limitType === "global") {
    return `We've reached our daily limit for all users. Please try again in ${timeStr}. This helps us keep the service free during beta!`;
  }

  if (result.limitType === "hourly") {
    return `You've used your ${RATE_LIMITS.PER_IP_HOURLY} requests for this hour. Try again in ${timeStr}, or come back later (you have ${result.dailyRemaining} requests left today).`;
  }

  if (result.limitType === "daily") {
    return `You've reached your daily limit of ${RATE_LIMITS.PER_IP_DAILY} palettes. Try again in ${timeStr}. Thanks for testing!`;
  }

  return "Rate limit exceeded. Please try again later.";
}
