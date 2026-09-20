import { describe, it, expect } from "vitest";
import {
  fillUiCopy,
  formatPaperLabel,
  formatPaperTitle,
  formatPartHeading,
  getUiCopy,
  hasUiCopy,
  localeKeys,
} from "./uiCopy";

describe("uiCopy", () => {
  it("loads Spanish chrome from the locale JSON and fills SoT counts", () => {
    const copy = getUiCopy("es");
    expect(copy.startReading).toBe("Empezar a leer");
    expect(copy.allPapers).toBe("Todos los documentos");
    expect(copy.paperLabel).toBe("Documento {id}");
    expect(fillUiCopy(copy.heroSubtitle, { paperCount: 197, partCount: 5 })).toBe(
      "197 documentos en 5 partes — títulos y patrocinios del árbol de idioma."
    );
    expect(copy.ideasHeading).toBe("Ideas que desafían nuestra comprensión");
    expect(copy.ideaScienceTitle).toBe("Más allá de la ciencia moderna");
    expect(copy.ctaHeading).toBe("Aprendamos juntos");
    expect(copy.comingSoon).toBe("Próximamente");
  });

  it("keeps every locale on the same key set as English", () => {
    const english = localeKeys("eng");
    expect(localeKeys("es")).toEqual(english);
    expect(localeKeys("fr")).toEqual(english);
    expect(localeKeys("de")).toEqual(english);
  });

  it("formats paper and part chrome from the catalog", () => {
    const es = getUiCopy("es");
    expect(formatPaperLabel(es, "0")).toBe("Prólogo");
    expect(formatPaperLabel(es, "2")).toBe("Documento 2");
    expect(
      formatPartHeading(es, "1", "The Central and Superuniverses")
    ).toBe("Parte 1: The Central and Superuniverses");
    expect(formatPaperTitle(es, "2", "La Naturaleza de Dios")).toBe(
      "Documento 2 - La Naturaleza de Dios"
    );
    expect(formatPaperTitle(es, "0", "Prólogo")).toBe("Prólogo");
    expect(fillUiCopy(es.partPapers, { id: "1" })).toBe(
      "Documentos de la parte 1"
    );
  });

  it("falls back to English for an unknown code", () => {
    expect(hasUiCopy("es")).toBe(true);
    expect(hasUiCopy("ar")).toBe(false);
    expect(getUiCopy("ar").heroTitle).toBe(getUiCopy("eng").heroTitle);
  });
});
