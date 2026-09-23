import { afterEach, describe, expect, it, vi } from "vitest";
import { editionQuery, fetchPaper, fetchToc, resolveApiHost } from "./client";

const PUBLIC = "https://api.urantia.dev";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.URANTIA_DEV_API_INTERNAL_HOST;
  process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST = PUBLIC;
});

describe("papers client", () => {
  it("uses the public host in the browser and the internal host on the server", () => {
    process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST = PUBLIC;
    process.env.URANTIA_DEV_API_INTERNAL_HOST = "http://api:3000";
    expect(resolveApiHost(process.env, false)).toBe(PUBLIC);
    expect(resolveApiHost(process.env, true)).toBe("http://api:3000");
    delete process.env.URANTIA_DEV_API_INTERNAL_HOST;
    expect(resolveApiHost(process.env, true)).toBe(PUBLIC);
  });

  it("leaves English fetches on the bare path", async () => {
    process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST = PUBLIC;
    const urls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      urls.push(String(url));
      return { ok: false, status: 404, statusText: "missing" };
    });
    await expect(fetchPaper("1")).rejects.toThrow();
    await expect(fetchToc()).rejects.toThrow();
    expect(editionQuery("eng", "ignored")).toBe("");
    expect(urls).toEqual([`${PUBLIC}/papers/1`, `${PUBLIC}/toc`]);
  });

  it("adds lang and source only for another edition", async () => {
    process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST = PUBLIC;
    const urls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      urls.push(String(url));
      return { ok: false, status: 404, statusText: "missing" };
    });
    await expect(fetchPaper("1", "es", "spa-1993")).rejects.toThrow();
    await expect(fetchToc("fr")).rejects.toThrow();
    expect(urls).toEqual([
      `${PUBLIC}/papers/1?lang=es&source=spa-1993`,
      `${PUBLIC}/toc?lang=fr`,
    ]);
  });
});
