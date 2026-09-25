export const READING_LANGUAGE_KEY = "readingLanguage";
export const READING_SOURCE_KEY = "readingSource";
export const READING_LANGUAGE_COOKIE = "readingLanguage";
export const READING_SOURCE_COOKIE = "readingSource";

export type ReaderSource = {
  id: string;
  label: string;
  treeSlug?: string;
  editionEnglish?: string | null;
  editionNative?: string | null;
  bookTitle?: string | null;
  regionCode?: string | null;
  versionNumber?: string | null;
  firstPublished?: number | null;
  isPrimary: boolean;
};

export type ReaderLangOption = {
  code: string;
  slug?: string;
  bcp47?: string;
  label: string;
  uiLabelEnglish?: string;
  sources: ReaderSource[];
};

export const ENGLISH_LANG: ReaderLangOption = {
  code: "eng",
  label: "English",
  sources: [],
};

export function isLanguageCode(value: unknown): value is string {
  return typeof value === "string" && /^[a-z]{2,8}$/.test(value);
}

export function isSourceId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9._:-]{3,120}$/.test(value);
}

export function showLanguageControl(
  languages: readonly ReaderLangOption[]
): boolean {
  return languages.length > 1;
}

export function readStoredReadingLanguage(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(READING_LANGUAGE_KEY);
  return isLanguageCode(stored) ? stored : null;
}

export function readStoredReadingSource(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(READING_SOURCE_KEY);
  return isSourceId(stored) ? stored : null;
}

export function writeStoredReadingLanguage(language: string): void {
  if (typeof window === "undefined" || !isLanguageCode(language)) return;
  window.localStorage.setItem(READING_LANGUAGE_KEY, language);
}

export function writeStoredReadingSource(sourceId: string | null): void {
  if (typeof window === "undefined") return;
  if (!sourceId) {
    window.localStorage.removeItem(READING_SOURCE_KEY);
    return;
  }
  if (!isSourceId(sourceId)) return;
  window.localStorage.setItem(READING_SOURCE_KEY, sourceId);
}

function writeCookie(name: string, value: string | null) {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  if (!value) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    return;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function writeReadingCookies(
  language: string,
  sourceId: string | null
): void {
  writeCookie(READING_LANGUAGE_COOKIE, language);
  writeCookie(
    READING_SOURCE_COOKIE,
    language === "eng" ? null : sourceId
  );
}

export function readCookieValue(
  cookieHeader: string | undefined,
  name: string
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.slice(name.length + 1));
  return value || null;
}

export function primarySource(
  lang?: ReaderLangOption | null
): ReaderSource | undefined {
  const sources = lang?.sources ?? [];
  return sources.find((source) => source.isPrimary) ?? sources[0];
}

export function primarySourceId(lang?: ReaderLangOption | null): string | null {
  return primarySource(lang)?.id ?? null;
}

export function resolveSource(
  lang?: ReaderLangOption | null,
  sourceId?: string | null
): ReaderSource | undefined {
  const sources = lang?.sources ?? [];
  if (sourceId) {
    const match = sources.find((source) => source.id === sourceId);
    if (match) return match;
  }
  return primarySource(lang);
}

export function sourceStamp(source?: ReaderSource | null): string {
  if (!source) return "";
  const year =
    typeof source.firstPublished === "number" && source.firstPublished > 0
      ? `(${source.firstPublished})`
      : "";
  const version = source.versionNumber ? `v${source.versionNumber}` : "";
  if (year && version) return `${year} | ${version}`;
  return year || version;
}

export type SourceDetailCard = {
  title: string | null;
  tag: string | null;
  edition: string | null;
  year: number | null;
  version: string | null;
  id: string;
};

export function sourceDetailCard(
  source?: ReaderSource | null
): SourceDetailCard | null {
  if (!source) return null;
  const title = source.bookTitle?.trim() || source.label?.trim() || null;
  const tag = source.editionNative?.trim() || null;
  const edition = source.editionEnglish?.trim() || null;
  return {
    title,
    tag: tag && tag !== title ? tag : null,
    edition: edition && edition !== title && edition !== tag ? edition : null,
    year:
      typeof source.firstPublished === "number" && source.firstPublished > 0
        ? source.firstPublished
        : null,
    version: source.versionNumber?.trim() || null,
    id: source.id,
  };
}

export function isHoverPointer(pointerType?: string | null): boolean {
  return pointerType !== "touch";
}

export function languageRowAction(input: {
  hasEditions: boolean;
  pointerType?: string | null;
  revealed: boolean;
  detailsInline?: boolean;
}): "reveal" | "activate" {
  if (
    input.hasEditions &&
    !input.revealed &&
    (input.detailsInline || !isHoverPointer(input.pointerType))
  ) {
    return "reveal";
  }
  return "activate";
}

export function editionRowAction(
  pointerType?: string | null,
  detailsVisible = false
): "preview" | "activate" {
  if (detailsVisible) return "activate";
  return isHoverPointer(pointerType) ? "activate" : "preview";
}

export function pickerSurface(input: {
  finePointer: boolean;
  wide: boolean;
  hoverPanes?: boolean;
}): "popover" | "sheet" {
  if (input.hoverPanes === false) return "sheet";
  return input.finePointer && input.wide ? "popover" : "sheet";
}

export function resolveSourceId(
  languages: readonly ReaderLangOption[],
  language: string,
  sourceId?: string | null
): string | null {
  if (language === "eng") return null;
  const lang = languages.find((item) => item.code === language);
  if (!lang) return isSourceId(sourceId) ? sourceId : null;
  if (sourceId && lang.sources.some((source) => source.id === sourceId)) {
    return sourceId;
  }
  return primarySourceId(lang);
}
