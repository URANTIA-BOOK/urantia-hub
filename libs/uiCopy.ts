import { useReadingLanguage } from "@/context/readingLanguage";
import de from "@/locales/de.json";
import eng from "@/locales/eng.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";

export type UiCopy = typeof eng;

const COPY: Record<string, UiCopy> = { eng, es, fr, de };

export function getUiCopy(language: string): UiCopy {
  return COPY[language] ?? COPY.eng;
}

function leafKeys(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [prefix];
}

export function localeKeys(language = "eng"): string[] {
  return leafKeys(getUiCopy(language)).sort();
}

/** UI copy follows the single reading-language context owned by the app. */
export function useUiCopy(): UiCopy {
  const { language } = useReadingLanguage();
  return getUiCopy(language);
}
