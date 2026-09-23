import { describe, expect, it } from "vitest";
import { editionFromRequest } from "./editionRequest";

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
