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

export function detectBrowserLanguage(
  input?: string | null
): ReaderLang | null {
  const raw = (input ?? "").toLowerCase();
  if (!raw) return null;
  if (raw.startsWith("es")) return "es";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("de")) return "de";
  if (raw.startsWith("en")) return "eng";
  return null;
}

export function detectNavigatorLanguage(): ReaderLang | null {
  if (typeof navigator === "undefined") return null;
  return detectBrowserLanguage(navigator.language);
}
