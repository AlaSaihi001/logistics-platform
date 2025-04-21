// lib/rate-limiter.ts

import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"
import { NextRequest } from "next/server"

// Redis client
const redis = Redis.fromEnv()

// Limiteur global par défaut : 10 requêtes par minute
const defaultLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1m"),
  analytics: true,
})

/**
 * Middleware de rate limiting
 */
export async function rateLimiter(
  req: NextRequest,
  identifier?: string,
  limit?: number,
  window?: number
) {
  try {
    const ip = identifier || req.headers.get("x-forwarded-for") || "127.0.0.1"

    const limiter =
      limit && window
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${window}s`),
            analytics: true,
          })
        : defaultLimiter

    const { success, limit: rateLimit, remaining, reset } = await limiter.limit(ip)

    const headers = {
      "X-RateLimit-Limit": rateLimit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    }

    if (!success) {
      return { success, limit: rateLimit, remaining, reset } // Return the correct structure
    }

    return null
  } catch (error) {
    console.error("Rate limiter error:", error)
    return null
  }
}
