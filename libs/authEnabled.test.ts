import { describe, it, expect } from "vitest";
import {
  authOffNextAuthKind,
  configuredSignInMethods,
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

  it("names each complete pair for the sign-in page", () => {
    expect(
      configuredSignInMethods({
        GOOGLE_CLIENT_ID: "id",
        GOOGLE_CLIENT_SECRET: "secret",
      })
    ).toEqual({ email: false, google: true });
    expect(
      configuredSignInMethods({ RESEND_API_KEY: "key", EMAIL_FROM: "a@b.c" })
    ).toEqual({ email: true, google: false });
    expect(
      configuredSignInMethods({
        GOOGLE_CLIENT_ID: "id",
        GOOGLE_CLIENT_SECRET: "secret",
        RESEND_API_KEY: "key",
        EMAIL_FROM: "a@b.c",
      })
    ).toEqual({ email: true, google: true });
    expect(configuredSignInMethods({})).toEqual({ email: false, google: false });
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
