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

type SavedPlace = { paperId?: string | null; globalId?: string | null } | null;

// The hero button for a signed-out reader: the saved place, or the Foreword.
export const deriveSignedOutReadButton = (
  savedPlace: SavedPlace
): { href: string; label: string } => {
  if (savedPlace?.paperId && savedPlace?.globalId) {
    return {
      href: `/api/redirect/user/read?paperId=${savedPlace.paperId}&globalId=${savedPlace.globalId}`,
      label: "Continue Reading",
    };
  }

  return { href: "/papers/foreword", label: "Start Reading" };
};
