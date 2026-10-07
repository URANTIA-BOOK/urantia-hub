import { describe, expect, it } from "vitest";
import de from "@/locales/de.json";
import eng from "@/locales/eng.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import { localeKeys } from "./uiCopy";

describe("landing copy", () => {
  it("uses the homepage sentences from this snapshot", () => {
    expect(eng.heroTitle).toBe(
      "Revolutionary Ideas for Life's Biggest Questions"
    );
    expect(eng.insightJesusTitle).toBe("Who Was Jesus?");
    expect(eng.papersBody).toContain("celestial beings");
  });

  it("keeps the same keys in Spanish, French, and German", () => {
    const keys = localeKeys("eng");
    expect(localeKeys("es")).toEqual(keys);
    expect(localeKeys("fr")).toEqual(keys);
    expect(localeKeys("de")).toEqual(keys);
    expect(Object.keys(es).length).toBe(Object.keys(eng).length);
    expect(Object.keys(fr).length).toBe(Object.keys(eng).length);
    expect(Object.keys(de).length).toBe(Object.keys(eng).length);
  });
});
