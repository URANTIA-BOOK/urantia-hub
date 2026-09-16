import { describe, it, expect } from "vitest";
import {
  authOffNextAuthKind,
  isAuthEnabled,
  nextAuthAction,
} from "./authEnabled";

describe("isAuthEnabled", () => {
  it("is off when the env is missing so local deploys skip login", () => {
    expect(isAuthEnabled({})).toBe(false);
    expect(isAuthEnabled({ AUTH_ENABLED: "" })).toBe(false);
    expect(isAuthEnabled({ AUTH_ENABLED: "0" })).toBe(false);
  });

  it("is on only when AUTH_ENABLED or NEXT_PUBLIC_AUTH_ENABLED is 1/true", () => {
    expect(isAuthEnabled({ AUTH_ENABLED: "1" })).toBe(true);
    expect(isAuthEnabled({ NEXT_PUBLIC_AUTH_ENABLED: "true" })).toBe(true);
    expect(isAuthEnabled({ NEXT_PUBLIC_AUTH_ENABLED: "1", AUTH_ENABLED: "0" })).toBe(
      true
    );
  });

  it("keeps session probes as JSON and temp-redirects the rest", () => {
    expect(authOffNextAuthKind("session")).toBe("session");
    expect(authOffNextAuthKind("csrf")).toBe("csrf");
    expect(authOffNextAuthKind("providers")).toBe("providers");
    expect(authOffNextAuthKind("signin")).toBe("redirect");
    expect(authOffNextAuthKind("callback")).toBe("redirect");
    expect(nextAuthAction(["signin", "email"])).toBe("signin");
    expect(nextAuthAction(["session"])).toBe("session");
  });
});
