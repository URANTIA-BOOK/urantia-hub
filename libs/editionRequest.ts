const LANGUAGE_COOKIE = "readingLanguage";
const SOURCE_COOKIE = "readingSource";

import type { ApiLanguage } from "@/libs/urantiaApi/types";

export type EditionLink = {
  hrefLang: string;
  href: string;
};

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

export function editionPageUrl(
  origin: string,
  path: string,
  lang?: string | null,
  source?: string | null
): string {
  const url = new URL(path, origin);
  if (lang && lang !== "eng") {
    url.searchParams.set("lang", lang);
    if (source) url.searchParams.set("source", source);
  }
  return url.toString();
}

/** Build crawlable alternates only from editions the API says it can serve. */
export function editionLinks(
  origin: string,
  path: string,
  languages: ApiLanguage[]
): EditionLink[] {
  const links = languages.flatMap((language) => {
    const primarySource = language.sources?.find((source) => source.isPrimary)
      ?? language.sources?.[0];
    if (language.code !== "eng" && !primarySource) return [];
    return [{
      hrefLang: language.bcp47 || (language.code === "eng" ? "en" : language.code),
      href: editionPageUrl(origin, path, language.code, primarySource?.id),
    }];
  });
  const english = links.find((link) => link.hrefLang === "en");
  return english
    ? [...links, { hrefLang: "x-default", href: english.href }]
    : links;
}
