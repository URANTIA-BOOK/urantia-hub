import { describe, expect, it } from "vitest";
import { rateLimitBucket } from "./middleware";

describe("auth rate limit buckets", () => {
  it("keeps the Google callback off the session probe counter", () => {
    expect(rateLimitBucket("/api/auth/callback/google")).toBe("/api/auth");
    expect(rateLimitBucket("/api/auth/signin/google")).toBe("/api/auth");
    expect(rateLimitBucket("/api/auth/session")).toBe("/api/auth/probe");
    expect(rateLimitBucket("/api/auth/csrf")).toBe("/api/auth/probe");
    expect(rateLimitBucket("/api/auth/providers")).toBe("/api/auth/probe");
    expect(rateLimitBucket("/api/auth/callback/google")).not.toBe(
      rateLimitBucket("/api/auth/session")
    );
  });
});
