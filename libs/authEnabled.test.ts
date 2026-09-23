import { describe, it, expect } from "vitest";
import {
  authOffNextAuthKind,
  emailAuthConfigured,
  googleAuthConfigured,
  isAuthEnabled,
  nextAuthAction,
} from "./authEnabled";

describe("isAuthEnabled", () => {
  it("is off when the provider keys are missing or incomplete", () => {
    expect(isAuthEnabled({})).toBe(false);
    expect(isAuthEnabled({ GOOGLE_CLIENT_ID: "id" })).toBe(false);
    expect(isAuthEnabled({ RESEND_API_KEY: "key" })).toBe(false);
    expect(isAuthEnabled({ EMAIL_FROM: "a@b.c" })).toBe(false);
    expect(emailAuthConfigured({ RESEND_API_KEY: "  ", EMAIL_FROM: "a@b.c" })).toBe(
      false
    );
    expect(googleAuthConfigured({ GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "" })).toBe(
      false
    );
  });

  it("is on when either provider pair is complete", () => {
    expect(
      isAuthEnabled({ GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret" })
    ).toBe(true);
    expect(
      isAuthEnabled({ RESEND_API_KEY: "key", EMAIL_FROM: "a@b.c" })
    ).toBe(true);
  });

  it("keeps session probes as JSON and redirects the rest", () => {
    expect(authOffNextAuthKind("session")).toBe("session");
    expect(authOffNextAuthKind("csrf")).toBe("csrf");
    expect(authOffNextAuthKind("providers")).toBe("providers");
    expect(authOffNextAuthKind("signin")).toBe("redirect");
    expect(authOffNextAuthKind("callback")).toBe("redirect");
    expect(nextAuthAction(["signin", "email"])).toBe("signin");
    expect(nextAuthAction(["session"])).toBe("session");
    expect(nextAuthAction(undefined)).toBe("");
  });
});
