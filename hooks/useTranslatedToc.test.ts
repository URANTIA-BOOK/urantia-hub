import { describe, it, expect } from "vitest";
import { overlayTranslatedToc } from "./useTranslatedToc";

describe("overlayTranslatedToc", () => {
  const source = [
    { type: "part", partId: "1", partTitle: "The Central and Superuniverses" },
    { type: "paper", partId: "1", paperId: "1", paperTitle: "The Universal Father" },
  ];

  it("overlays paper and part titles from the language tree", () => {
    const next = overlayTranslatedToc(source, [
      { type: "part", partId: "1", partTitle: "Los universos central y superuniversos" },
      { type: "paper", paperId: "1", paperTitle: "El Padre Universal" },
    ]);
    expect(next[0].partTitle).toBe("Los universos central y superuniversos");
    expect(next[1].paperTitle).toBe("El Padre Universal");
  });

  it("leaves the source alone when the overlay is empty", () => {
    expect(overlayTranslatedToc(source, [])).toBe(source);
  });
});
