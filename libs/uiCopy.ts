import { useReadingLanguage } from "@/context/readingLanguage";
import type { ReaderLang } from "@/libs/readingLanguage";
import de from "@/locales/de.json";
import eng from "@/locales/eng.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";

export type UiCopy = typeof eng;

const COPY: Record<ReaderLang, UiCopy> = {
  eng,
  es,
  fr,
  de,
};

export function getUiCopy(language: ReaderLang): UiCopy {
  return COPY[language] ?? COPY.eng;
}

export function fillUiCopy(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values[key] === undefined ? `{${key}}` : String(values[key])
  );
}

export function useUiCopy(): UiCopy {
  const { language } = useReadingLanguage();
  return getUiCopy(language);
}

export function formatPaperLabel(copy: UiCopy, paperId: string): string {
  return paperId === "0"
    ? copy.forewordLabel
    : fillUiCopy(copy.paperLabel, { id: paperId });
}

export function formatPaperTitle(
  copy: UiCopy,
  paperId: string,
  paperTitle?: string | null
): string {
  const label = formatPaperLabel(copy, paperId);
  if (paperId === "0" || !paperTitle) return label;
  return fillUiCopy(copy.paperTitle, { label, title: paperTitle });
}

export function formatPartHeading(
  copy: UiCopy,
  partId: string,
  title?: string | null
): string {
  if (title) return fillUiCopy(copy.partHeading, { id: partId, title });
  return fillUiCopy(copy.partLabel, { id: partId });
}

export function localeKeys(language: ReaderLang = "eng"): string[] {
  return Object.keys(getUiCopy(language)).sort();
}
