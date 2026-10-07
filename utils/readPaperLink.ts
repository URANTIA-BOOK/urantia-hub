import { editionQuery } from "@/libs/urantiaApi/client";
import {
  readStoredReadingLanguage,
  readStoredReadingSource,
} from "@/libs/readingLanguage";

/**
 * Constructs the Read link URL based on authentication status.
 * If unauthenticated, it attempts to retrieve the last visited node from localStorage.
 * @param {boolean} isAuthenticated - The authentication status.
 * @returns {string} The URL for the Read link.
 */
export const deriveReadLink = (
  status: "authenticated" | "loading" | "unauthenticated"
): string => {
  const edition = editionQuery(
    readStoredReadingLanguage(),
    readStoredReadingSource()
  );
  const withEdition = (href: string) => {
    if (!edition) return href;
    return href.includes("?")
      ? `${href}&${edition.slice(1)}`
      : `${href}${edition}`;
  };

  if (status === "loading") {
    return withEdition("/api/redirect/user/read");
  }

  if (status === "authenticated") {
    return withEdition("/api/redirect/user/read");
  }

  if (status === "unauthenticated") {
    const lastVisitedNode = localStorage.getItem("lastVisitedNode")
      ? JSON.parse(localStorage.getItem("lastVisitedNode") as string)
      : null;

    if (lastVisitedNode) {
      return withEdition(
        `/api/redirect/user/read?paperId=${lastVisitedNode.paperId}&globalId=${lastVisitedNode.globalId}`
      );
    }
    return withEdition("/api/redirect/user/read");
  }

  return withEdition("/api/redirect/user/read");
};
