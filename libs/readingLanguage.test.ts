import { describe, it, expect, beforeEach } from "vitest";
import {
  detectBrowserLanguage,
  isReaderLang,
  readStoredReadingLanguage,
  writeStoredReadingLanguage,
  READING_LANGUAGE_KEY,
} from "./readingLanguage";

describe("readingLanguage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("accepts only seeded reader codes", () => {
    expect(isReaderLang("es")).toBe(true);
    expect(isReaderLang("eng")).toBe(true);
    expect(isReaderLang("pt")).toBe(false);
    expect(isReaderLang("spa")).toBe(false);
  });

  it("reads nothing until a valid code is stored", () => {
    expect(readStoredReadingLanguage()).toBeNull();
    localStorage.setItem(READING_LANGUAGE_KEY, "nope");
    expect(readStoredReadingLanguage()).toBeNull();
  });

  it("writes only when the value changes", () => {
    writeStoredReadingLanguage("es");
    expect(localStorage.getItem(READING_LANGUAGE_KEY)).toBe("es");
    writeStoredReadingLanguage("es");
    expect(localStorage.getItem(READING_LANGUAGE_KEY)).toBe("es");
    writeStoredReadingLanguage("fr");
    expect(localStorage.getItem(READING_LANGUAGE_KEY)).toBe("fr");
  });

  it("maps browser locales onto reader codes", () => {
    expect(detectBrowserLanguage("es-MX")).toBe("es");
    expect(detectBrowserLanguage("fr-FR")).toBe("fr");
    expect(detectBrowserLanguage("de")).toBe("de");
    expect(detectBrowserLanguage("en-US")).toBe("eng");
    expect(detectBrowserLanguage("pt-BR")).toBeNull();
  });
});
