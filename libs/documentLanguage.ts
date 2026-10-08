import { editionFromRequest } from "@/libs/editionRequest";
import { htmlLanguageTag } from "@/libs/readingLanguage";

export function documentLanguage(
  query: Record<string, string | string[] | undefined>,
  cookieHeader?: string
): string {
  const { lang } = editionFromRequest(query, cookieHeader);
  return htmlLanguageTag(lang);
}
