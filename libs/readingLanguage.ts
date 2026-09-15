export const READING_LANGUAGE_KEY = "readingLanguage";

export const READER_LANGS = [
  { code: "eng", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
] as const;

export type ReaderLang = (typeof READER_LANGS)[number]["code"];

export function isReaderLang(value: unknown): value is ReaderLang {
  return READER_LANGS.some((item) => item.code === value);
}

export function readStoredReadingLanguage(): ReaderLang | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(READING_LANGUAGE_KEY);
  return isReaderLang(stored) ? stored : null;
}

export function writeStoredReadingLanguage(language: ReaderLang): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(READING_LANGUAGE_KEY) === language) return;
  window.localStorage.setItem(READING_LANGUAGE_KEY, language);
}
