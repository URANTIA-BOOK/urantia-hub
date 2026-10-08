import { editionQuery } from "@/libs/urantiaApi/client";
import { paperIdToUrl } from "@/utils/paperFormatters";

export function paperHref(
  paperId: string,
  hash?: string | null,
  lang?: string | null,
  source?: string | null
): string {
  const anchor = hash ? `#${hash}` : "";
  return `/papers/${paperIdToUrl(String(paperId))}${editionQuery(lang, source)}${anchor}`;
}

export function withEdition(
  href: string,
  lang?: string | null,
  source?: string | null
): string {
  const query = editionQuery(lang, source);
  if (!query) return href;
  const hashAt = href.indexOf("#");
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";
  const path = hashAt >= 0 ? href.slice(0, hashAt) : href;
  if (path.includes("?")) {
    return `${path}&${query.slice(1)}${hash}`;
  }
  return `${path}${query}${hash}`;
}
