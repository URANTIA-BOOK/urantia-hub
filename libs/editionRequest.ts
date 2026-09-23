const LANGUAGE_COOKIE = "readingLanguage";
const SOURCE_COOKIE = "readingSource";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isLanguageCode(value: string | undefined): value is string {
  return typeof value === "string" && /^[a-z]{2,8}$/.test(value);
}

function isSourceId(value: string | undefined): value is string {
  return typeof value === "string" && /^[A-Za-z0-9._:-]{3,120}$/.test(value);
}

export function readRequestCookie(
  cookieHeader: string | undefined,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return undefined;
  const value = decodeURIComponent(match.slice(name.length + 1));
  return value || undefined;
}

/** Query wins, then the reading cookie, then English (no extra query). */
export function editionFromRequest(
  query: Record<string, string | string[] | undefined>,
  cookieHeader?: string
): { lang?: string; source?: string | null } {
  const queryLang = first(query.lang);
  const cookieLang = readRequestCookie(cookieHeader, LANGUAGE_COOKIE);
  const lang = isLanguageCode(queryLang)
    ? queryLang
    : isLanguageCode(cookieLang)
      ? cookieLang
      : undefined;
  const querySource = first(query.source);
  const cookieSource = readRequestCookie(cookieHeader, SOURCE_COOKIE);
  const source = isSourceId(querySource)
    ? querySource
    : isSourceId(cookieSource)
      ? cookieSource
      : null;
  return { lang, source };
}

export function cacheEdition(res: {
  setHeader: (name: string, value: string) => void;
}) {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=604800"
  );
}
