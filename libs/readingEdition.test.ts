import { describe, expect, it } from "vitest";
import { ENGLISH_LANG, showLanguageControl } from "./readingLanguage";
import { paperHref } from "./readingFlow";
import { paperIdToUrl } from "@/utils/paperFormatters";

const spanish = {
  code: "es",
  label: "Español",
  sources: [{ id: "spa-1993", label: "1993", isPrimary: true }],
};

describe("reading edition", () => {
  it("hides the control when the catalog is English only", () => {
    expect(showLanguageControl([ENGLISH_LANG])).toBe(false);
    expect(showLanguageControl([])).toBe(false);
  });

  it("shows the control when another language is listed", () => {
    expect(showLanguageControl([ENGLISH_LANG, spanish])).toBe(true);
  });

  it("keeps English paper links bare and carries another edition", () => {
    expect(paperHref("1", null, "eng", null)).toBe(
      `/papers/${paperIdToUrl("1")}`
    );
    expect(paperHref("1", "1:0.1", "es", "spa-1993")).toBe(
      `/papers/${paperIdToUrl("1")}?lang=es&source=spa-1993#1:0.1`
    );
  });
});
