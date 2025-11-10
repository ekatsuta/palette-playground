import type { VercelRequest } from "@vercel/node";

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

// In-memory stores (resets on cold starts - update to use Vercel KV once out of beta)
const ipStore: Record<string, RateLimitEntry> = {};
let globalStore: GlobalLimitEntry = {
  count: 0,
  resetTime: getNextMidnight(),
};

// Cleanup tracking
let lastCleanupTime = Date.now();

// Configuration
export const RATE_LIMITS = {
  PER_IP_HOURLY: 10,
  PER_IP_DAILY: 30,
  GLOBAL_DAILY: 300,
};

// Cleanup interval: 10 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  limitType?: "hourly" | "daily" | "global";
  hourlyRemaining: number;
  dailyRemaining: number;
  resetTime: number;
  resetMinutes: number;
}

/**
 * Clean up stale IP entries to prevent memory leaks
 * Removes entries where both hourly and daily reset times have passed
 */
function cleanupStaleEntries(now: number): void {
  const entriesBefore = Object.keys(ipStore).length;

  for (const ip in ipStore) {
    const entry = ipStore[ip];
    // Remove entry if both reset times have passed (IP is no longer active)
    if (entry.hourlyResetTime < now && entry.dailyResetTime < now) {
      delete ipStore[ip];
    }
  }

  const entriesAfter = Object.keys(ipStore).length;
  const removed = entriesBefore - entriesAfter;

  if (removed > 0) {
    console.log(`🧹 Cleaned up ${removed} stale IP entries (${entriesAfter} remaining)`);
  }

  lastCleanupTime = now;
}

/**
 * Check if request is allowed based on rate limits
 */
export function checkRateLimit(req: VercelRequest): RateLimitResult {
  const ip = getClientIP(req);
  const now = Date.now();

  // Periodically clean up stale entries
  if (now - lastCleanupTime > CLEANUP_INTERVAL) {
    cleanupStaleEntries(now);
  }

  // Check global daily limit first
  if (globalStore.resetTime < now) {
    globalStore = {
      count: 0,
      resetTime: getNextMidnight(),
    };
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
  if (!ipStore[ip]) {
    ipStore[ip] = {
      hourlyCount: 0,
      dailyCount: 0,
      hourlyResetTime: now + 60 * 60 * 1000, // 1 hour
      dailyResetTime: getNextMidnight(),
    };
  }

  const entry = ipStore[ip];

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
  globalStore.count++;

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
