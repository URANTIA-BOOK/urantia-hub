import { describe, expect, it } from "vitest";
import { documentLanguage } from "./documentLanguage";

describe("documentLanguage", () => {
  it("uses the requested edition before the reading cookie", () => {
    expect(documentLanguage({ lang: "es" }, "readingLanguage=fr")).toBe(
      "es"
    );
  });

  it("uses the reading cookie when the query omits an edition", () => {
    expect(documentLanguage({}, "readingLanguage=fr")).toBe("fr");
  });

  it("uses the BCP-47 English tag by default", () => {
    expect(documentLanguage({})).toBe("en");
    expect(documentLanguage({ lang: "eng" })).toBe("en");
  });
});
