import { describe, it, expect, beforeEach } from "vitest";
import {
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
});
