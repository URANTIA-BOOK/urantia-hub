import { describe, it, expect, beforeEach } from "vitest";
import {
  detectBrowserLanguage,
  htmlLangAttr,
  isLanguageCode,
  editionRowAction,
  languageRowAction,
  overlaySearch,
  pickerSurface,
  readStoredReadingLanguage,
  resolveSourceId,
  sourceDetailCard,
  sourceDetailLines,
  sourceStamp,
  writeStoredReadingLanguage,
  READING_LANGUAGE_KEY,
  ENGLISH_LANG,
} from "./readingLanguage";

const memory = new Map<string, string>();
const localStorageStub = {
  clear: () => memory.clear(),
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, value);
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageStub,
  configurable: true,
});
Object.defineProperty(globalThis, "window", {
  value: globalThis,
  configurable: true,
});

const catalog = [
  ENGLISH_LANG,
  { code: "es", slug: "spa", bcp47: "es", label: "Español" },
  { code: "fr", slug: "fre", bcp47: "fr", label: "Français" },
  { code: "de", slug: "ger", bcp47: "de", label: "Deutsch" },
];

describe("readingLanguage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("accepts API language codes, not a hardcoded catalog", () => {
    expect(isLanguageCode("es")).toBe(true);
    expect(isLanguageCode("eng")).toBe(true);
    expect(isLanguageCode("pt")).toBe(true);
    expect(isLanguageCode("spa")).toBe(true);
    expect(isLanguageCode("EN")).toBe(false);
    expect(isLanguageCode("not-a-code")).toBe(false);
  });

  it("reads nothing until a valid code is stored", () => {
    expect(readStoredReadingLanguage()).toBeNull();
    localStorage.setItem(READING_LANGUAGE_KEY, "EN");
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

  it("maps browser locales onto seeded catalog codes", () => {
    expect(detectBrowserLanguage("es-MX", catalog)).toBe("es");
    expect(detectBrowserLanguage("fr-FR", catalog)).toBe("fr");
    expect(detectBrowserLanguage("de", catalog)).toBe("de");
    expect(detectBrowserLanguage("en-US", catalog)).toBe("eng");
    expect(detectBrowserLanguage("pt-BR", catalog)).toBeNull();
    expect(detectBrowserLanguage("spa", catalog)).toBe("es");
  });

  it("uses catalog bcp47 for html lang", () => {
    expect(htmlLangAttr("eng")).toBe("en");
    expect(htmlLangAttr("es", catalog)).toBe("es");
  });

  it("lists version-table metadata on the details layer, not the language row", () => {
    const source = {
      id: "UF-SPA-419-1993-1.9",
      treeSlug: "spanish",
      bookTitle: "El libro de Urantia",
      editionNative: "Traducción al español",
      editionEnglish:
        "Spanish Translation (Latin American Edition), 2024 Release",
      firstPublished: 1993,
      versionNumber: "1.9",
      isPrimary: true,
    };
    expect(sourceDetailCard(source)).toEqual({
      title: "El libro de Urantia",
      tag: "Traducción al español",
      edition: "Spanish Translation (Latin American Edition), 2024 Release",
      year: 1993,
      version: "1.9",
      id: "UF-SPA-419-1993-1.9",
    });
    expect(sourceDetailLines(source)).toEqual([
      "El libro de Urantia",
      "Traducción al español",
      "Spanish Translation (Latin American Edition), 2024 Release",
      "(1993) | v1.9",
      "UF-SPA-419-1993-1.9",
    ]);
  });

  it("reveals a multi-edition row on the first touch, then activates", () => {
    expect(
      languageRowAction({
        hasEditions: true,
        pointerType: "touch",
        revealed: false,
      })
    ).toBe("reveal");
    expect(
      languageRowAction({
        hasEditions: true,
        pointerType: "touch",
        revealed: true,
      })
    ).toBe("activate");
    expect(
      languageRowAction({
        hasEditions: true,
        pointerType: "mouse",
        revealed: false,
      })
    ).toBe("activate");
    expect(
      languageRowAction({
        hasEditions: false,
        pointerType: "touch",
        revealed: false,
      })
    ).toBe("activate");
    expect(
      languageRowAction({
        hasEditions: true,
        pointerType: "mouse",
        revealed: false,
        detailsInline: true,
      })
    ).toBe("reveal");
  });

  it("previews an edition on touch and commits it on a hover pointer", () => {
    expect(editionRowAction("touch")).toBe("preview");
    expect(editionRowAction("mouse")).toBe("activate");
    expect(editionRowAction("pen")).toBe("activate");
    expect(editionRowAction("touch", true)).toBe("activate");
  });

  it("uses a sheet unless a fine pointer has room for the side panes", () => {
    expect(pickerSurface({ finePointer: true, wide: true })).toBe("popover");
    expect(pickerSurface({ finePointer: true, wide: false })).toBe("sheet");
    expect(pickerSurface({ finePointer: false, wide: true })).toBe("sheet");
    expect(pickerSurface({ finePointer: false, wide: false })).toBe("sheet");
    expect(
      pickerSurface({ finePointer: true, wide: true, hoverPanes: false })
    ).toBe("sheet");
  });

  it("stamps published year and version for the picker row", () => {
    expect(
      sourceStamp({
        id: "UF-SPA-419-1993-1.9",
        treeSlug: "spanish",
        firstPublished: 1993,
        versionNumber: "1.9",
        isPrimary: true,
      })
    ).toBe("(1993) | v1.9");
  });

  it("puts lang and source on the overlay query", () => {
    expect(overlaySearch("eng")).toBe("");
    expect(overlaySearch("es")).toBe("?lang=es");
    expect(overlaySearch("es", "UF-SPA-724-2009-1.13")).toBe(
      "?lang=es&source=UF-SPA-724-2009-1.13"
    );
  });

  it("keeps a source id before the catalog loads, then binds it to the language", () => {
    expect(
      resolveSourceId([ENGLISH_LANG], "es", "UF-SPA-724-2009-1.13")
    ).toBe("UF-SPA-724-2009-1.13");
    const spanish = {
      code: "es",
      slug: "spa",
      bcp47: "es",
      label: "Español",
      sources: [
        {
          id: "UF-SPA-419-1993-1.9",
          treeSlug: "spanish",
          firstPublished: 1993,
          versionNumber: "1.9",
          isPrimary: true,
        },
        {
          id: "UF-SPA-724-2009-1.13",
          treeSlug: "spanish_eur",
          firstPublished: 2009,
          versionNumber: "1.13",
          isPrimary: false,
        },
      ],
    };
    expect(resolveSourceId([ENGLISH_LANG, spanish], "es")).toBe(
      "UF-SPA-419-1993-1.9"
    );
    expect(
      resolveSourceId(
        [ENGLISH_LANG, spanish],
        "es",
        "UF-SPA-724-2009-1.13"
      )
    ).toBe("UF-SPA-724-2009-1.13");
  });
});
