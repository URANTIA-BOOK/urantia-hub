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

export function localeKeys(language = "eng"): string[] {
  return Object.keys(getUiCopy(language)).sort();
}

/** UI copy follows the single reading-language context owned by the app. */
export function useUiCopy(): UiCopy {
  const { language } = useReadingLanguage();
  return getUiCopy(language);
}
