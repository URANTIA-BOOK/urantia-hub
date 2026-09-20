import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_KEY = process.env.RESEND_API_KEY;

const loadModule = async () => {
  vi.resetModules();
  return import("./index");
};

afterEach(() => {
  if (ORIGINAL_KEY === undefined) {
    delete process.env.RESEND_API_KEY;
  } else {
    process.env.RESEND_API_KEY = ORIGINAL_KEY;
  }
});

describe("getResendClient", () => {
  it("does not throw when the module is imported without a key", async () => {
    delete process.env.RESEND_API_KEY;
    await expect(loadModule()).resolves.toBeDefined();
  });

  it("throws a named error when called without a key", async () => {
    delete process.env.RESEND_API_KEY;
    const { getResendClient } = await loadModule();
    expect(() => getResendClient()).toThrow(/RESEND_API_KEY/);
  });

  it("returns a client when the key is set", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const { getResendClient } = await loadModule();
    expect(getResendClient().emails).toBeDefined();
  });

  it("reuses one client across calls", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const { getResendClient } = await loadModule();
    expect(getResendClient()).toBe(getResendClient());
  });
});
