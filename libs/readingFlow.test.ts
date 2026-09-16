import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_START,
  LAST_VISITED_KEY,
  deriveReadHref,
  paperPath,
  resolveReadRedirect,
  readStoredLastVisited,
  writeStoredLastVisited,
} from "./readingFlow";

describe("readingFlow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("builds a paper path with language and hash", () => {
    expect(paperPath("0")).toBe("/papers/foreword");
    expect(paperPath("0", "0:0.0.1", "es")).toBe(
      "/papers/foreword?lang=es#0:0.0.1"
    );
    expect(paperPath("1", "1:0.1", "eng")).toBe(
      "/papers/paper-1-the-universal-father#1:0.1"
    );
  });

  it("puts intended flow on the redirect so anon and auth share one door", () => {
    expect(deriveReadHref()).toBe("/api/redirect/user/read");
    expect(
      deriveReadHref({ lastVisited: DEFAULT_START, language: "es" })
    ).toBe(
      "/api/redirect/user/read?paperId=0&globalId=0%3A0.0.1&lang=es"
    );
  });

  it("defaults the read door to the Foreword when nothing is stored", () => {
    expect(resolveReadRedirect({})).toBe("/papers/foreword#0:0.0.1");
    expect(
      resolveReadRedirect({ paperId: "5", language: "es" })
    ).toBe("/papers/paper-5-gods-relation-to-the-individual?lang=es");
    expect(
      resolveReadRedirect({
        paperId: "1",
        lastVisitedPaperId: "0",
        lastVisitedGlobalId: "0:0.0.1",
      })
    ).toBe("/papers/foreword#0:0.0.1");
  });

  it("round-trips last visited through the same storage key as progress", () => {
    expect(readStoredLastVisited()).toBeNull();
    writeStoredLastVisited(DEFAULT_START);
    expect(localStorage.getItem(LAST_VISITED_KEY)).toContain('"paperId":"0"');
    expect(readStoredLastVisited()?.globalId).toBe("0:0.0.1");
  });
});
