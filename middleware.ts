import { NextRequest, NextResponse } from "next/server";

// --- In-memory sliding window rate limiter ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  });
}

/**
 * Session probes and the sign-in callback must not share a counter.
 * The client polls session, csrf, and providers on every page; five of
 * those in a minute used to reject the Google callback.
 */
export function rateLimitBucket(pathname: string): string | null {
  if (
    pathname.startsWith("/api/auth/session") ||
    pathname.startsWith("/api/auth/csrf") ||
    pathname.startsWith("/api/auth/providers")
  ) {
    return "/api/auth/probe";
  }
  if (pathname.startsWith("/api/auth")) return "/api/auth";
  if (pathname.startsWith("/api/chat")) return "/api/chat";
  if (pathname.startsWith("/api/")) return "/api";
  return null;
}

function getRateLimit(pathname: string): { limit: number; windowMs: number } | null {
  const bucket = rateLimitBucket(pathname);
  if (bucket === "/api/auth/probe") return { limit: 60, windowMs: 60_000 };
  if (bucket === "/api/auth") return { limit: 5, windowMs: 60_000 };
  if (bucket === "/api/chat") return { limit: 20, windowMs: 60_000 };
  if (bucket === "/api") return { limit: 60, windowMs: 60_000 };
  return null;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine rate limit for this path
  const rateLimit = getRateLimit(pathname);
  if (!rateLimit) {
    return NextResponse.next();
  }

  // Run periodic cleanup
  cleanup();

  const ip = getClientIp(request);
  const bucket = rateLimitBucket(pathname);
  if (!bucket) return NextResponse.next();
  const key = `${ip}:${bucket}`;
  const now = Date.now();

  let entry = rateLimitMap.get(key);

  // If no entry or window expired, start a new window
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + rateLimit.windowMs };
    rateLimitMap.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, rateLimit.limit - entry.count);
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);

  // Rate limited
  if (entry.count > rateLimit.limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(retryAfterSeconds),
        },
      }
    );
  }

  // Allowed — attach rate limit headers
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:png|jpg|ico|svg|webp|woff2?)$).*)",
  ],
};
