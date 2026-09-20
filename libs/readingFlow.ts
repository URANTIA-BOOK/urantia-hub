import { paperIdToUrl } from "@/utils/paperFormatters";
import { overlaySearch } from "@/libs/readingLanguage";

export const LAST_VISITED_KEY = "lastVisitedNode";

export const DEFAULT_START: LastVisitedNode = {
  paperId: "0",
  globalId: "0:0.0.1",
  paperTitle: "Foreword",
};

export function isLastVisitedNode(value: unknown): value is LastVisitedNode {
  if (!value || typeof value !== "object") return false;
  const node = value as LastVisitedNode;
  return typeof node.paperId === "string" && node.paperId.length > 0;
}

export function readStoredLastVisited(): LastVisitedNode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_VISITED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isLastVisitedNode(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStoredLastVisited(node: LastVisitedNode): void {
  if (typeof window === "undefined") return;
  if (!isLastVisitedNode(node)) return;
  window.localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(node));
  window.dispatchEvent(new Event("reading-flow"));
}

export function paperPath(
  paperId: string,
  globalId?: string | null,
  language?: string | null,
  source?: string | null
): string {
  const path = `/papers/${paperIdToUrl(paperId)}`;
  const query = overlaySearch(language, source);
  const hash = globalId ? `#${globalId}` : "";
  return `${path}${query}${hash}`;
}

export function deriveReadHref(input?: {
  lastVisited?: LastVisitedNode | null;
  language?: string | null;
  source?: string | null;
}): string {
  const lastVisited = input?.lastVisited;
  const language = input?.language;
  const source = input?.source;
  const query = new URLSearchParams();
  if (lastVisited?.paperId) query.set("paperId", lastVisited.paperId);
  if (lastVisited?.globalId) query.set("globalId", lastVisited.globalId);
  if (language && language !== "eng") query.set("lang", language);
  if (source) query.set("source", source);
  const encoded = query.toString();
  return encoded
    ? `/api/redirect/user/read?${encoded}`
    : "/api/redirect/user/read";
}

/**
 * Server-side destination for the shared Read door. Account history wins when
 * present; otherwise the query (anon localStorage) or paper 0.
 */
export function resolveReadRedirect(input: {
  paperId?: string | null;
  globalId?: string | null;
  language?: string | null;
  source?: string | null;
  lastVisitedPaperId?: string | null;
  lastVisitedGlobalId?: string | null;
}): string {
  const paperId =
    input.lastVisitedPaperId || input.paperId || DEFAULT_START.paperId;
  const globalId =
    input.lastVisitedGlobalId ||
    input.globalId ||
    (paperId === DEFAULT_START.paperId ? DEFAULT_START.globalId : undefined);
  return paperPath(paperId, globalId, input.language, input.source);
}
