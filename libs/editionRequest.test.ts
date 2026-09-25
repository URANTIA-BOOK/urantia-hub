import { describe, expect, it } from "vitest";
import { editionFromRequest, editionLinks, editionPageUrl } from "./editionRequest";

describe("editionFromRequest", () => {
  it("stays English when the request has no language", () => {
    expect(editionFromRequest({})).toEqual({ lang: undefined, source: null });
  });

  it("lets the query win over the cookie", () => {
    expect(
      editionFromRequest(
        { lang: "es", source: "spa-1993" },
        "readingLanguage=fr; readingSource=fre-1960"
      )
    ).toEqual({ lang: "es", source: "spa-1993" });
  });

  it("uses the cookie when the query is absent", () => {
    expect(
      editionFromRequest({}, "readingLanguage=es; readingSource=spa-1993")
    ).toEqual({ lang: "es", source: "spa-1993" });
  });
});

describe("edition SEO links", () => {
  it("keeps English query-free and identifies the primary translated source", () => {
    const path = "/papers/paper-1-the-universal-father";
    expect(editionLinks("https://hub.example", path, [
      { code: "eng", name: "English", bcp47: "en", sources: [] },
      {
        code: "es",
        name: "Spanish",
        bcp47: "es",
        sources: [
          { id: "spa-draft" },
          { id: "spa-official", isPrimary: true },
        ],
      },
    ])).toEqual([
      { hrefLang: "en", href: `https://hub.example${path}` },
      {
        hrefLang: "es",
        href: `https://hub.example${path}?lang=es&source=spa-official`,
      },
      { hrefLang: "x-default", href: `https://hub.example${path}` },
    ]);
  });

  it("does not put source-only cookies into the English canonical URL", () => {
    expect(editionPageUrl("https://hub.example", "/papers/paper-1", undefined, "spa"))
      .toBe("https://hub.example/papers/paper-1");
  });
});
