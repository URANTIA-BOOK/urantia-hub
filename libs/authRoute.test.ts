import { describe, expect, it, vi } from "vitest";

const PROVIDER_KEYS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
] as const;

function clearProviderKeys() {
  for (const key of PROVIDER_KEYS) delete process.env[key];
}

describe("auth route", () => {
  it("returns an empty session when the provider keys are empty", async () => {
    clearProviderKeys();
    vi.resetModules();
    const { default: handler } = await import("@/pages/api/auth/[...nextauth]");
    let statusCode = 0;
    let body: unknown;
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        body = payload;
        return this;
      },
      redirect() {
        throw new Error("session must stay JSON");
      },
    };
    await handler(
      { query: { nextauth: ["session"] } } as never,
      res as never
    );
    expect(statusCode).toBe(200);
    expect(body).toEqual({});
  });

  it("includes Google when that pair is set", async () => {
    clearProviderKeys();
    process.env.GOOGLE_CLIENT_ID = "id";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    vi.resetModules();
    const { authOptions } = await import("@/pages/api/auth/[...nextauth]");
    const ids = authOptions.providers.map(
      (provider: { id?: string }) => provider.id
    );
    expect(ids).toContain("google");
    expect(ids).not.toContain("email");
  });
});
