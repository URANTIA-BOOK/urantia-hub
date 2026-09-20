import { deriveReadHref, readStoredLastVisited } from "@/libs/readingFlow";
import {
  readStoredReadingLanguage,
  readStoredReadingSource,
} from "@/libs/readingLanguage";

/**
 * Shared Read door. Auth and anon both carry intended flow through
 * lastVisitedNode; the redirect restores it the same way.
 */
export const deriveReadLink = (
  _status?: "authenticated" | "loading" | "unauthenticated"
): string => {
  if (typeof window === "undefined") return deriveReadHref();
  return deriveReadHref({
    lastVisited: readStoredLastVisited(),
    language: readStoredReadingLanguage(),
    source: readStoredReadingSource(),
  });
};
