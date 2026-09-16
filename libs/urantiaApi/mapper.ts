/**
 * Maps new API (api.urantia.dev) response shapes to the UBNode/TOCNode/SearchResult
 * types expected by UrantiaHub's existing code.
 */

import type { ApiParagraph, ApiTocPart } from "./types";

/**
 * Map a new API paragraph to the legacy UBNode shape.
 */
export function mapParagraphToUBNode(p: ApiParagraph): UBNode {
  return {
    globalId: p.id,
    htmlText: p.htmlText,
    text: p.text,
    paperId: p.paperId,
    paperTitle: p.paperTitle,
    sectionId: p.sectionId ?? null,
    sectionTitle: p.sectionTitle ?? null,
    partId: p.partId,
    standardReferenceId: p.standardReferenceId,
    paperSectionId: `${p.paperId}.${p.sectionId ?? "0"}`,
    paperSectionParagraphId: `${p.paperId}.${p.sectionId ?? "0"}.${p.paragraphId}`,
    labels: p.labels ?? [],
    language: p.language ?? "eng",
    type: "paragraph",
    objectID: p.id,
  };
}

/**
 * Map new API TOC (hierarchical parts) to the legacy flat TOCNode[] format
 * expected by pages/papers/index.tsx and pages/explore/index.tsx.
 *
 * The old API returned a flat array mixing "part" and "paper" type nodes.
 */
export function mapTocToFlatNodes(parts: ApiTocPart[]) {
  const nodes: Array<{
    globalId: string;
    labels: string[];
    paperId?: string;
    paperTitle?: string;
    partId: string;
    partSponsorship?: string;
    partTitle?: string;
    type: string;
  }> = [];

  for (const part of parts) {
    // Add part node
    nodes.push({
      globalId: `${part.id}:`,
      labels: [],
      partId: part.id,
      ...(part.sponsorship != null && { partSponsorship: part.sponsorship }),
      partTitle: part.title,
      type: "part",
    });

    // Add paper nodes
    for (const paper of part.papers) {
      nodes.push({
        globalId: `${part.id}:${paper.id}`,
        labels: paper.labels ?? [],
        paperId: paper.id,
        paperTitle: paper.title,
        partId: part.id,
        type: "paper",
      });
    }
  }

  return nodes;
}

/**
 * Map a new API search result to the legacy SearchResult shape.
 * The API already returns htmlText with highlight spans enriched via ts_headline,
 * so _highlightResult.htmlText.value just uses htmlText directly.
 */
export function mapSearchResult(r: ApiParagraph & { rank: number }): SearchResult {
  return {
    globalId: r.id,
    htmlText: r.htmlText,
    text: r.text,
    paperId: r.paperId,
    paperTitle: r.paperTitle,
    sectionId: r.sectionId ?? "",
    sectionTitle: r.sectionTitle ?? "",
    partId: r.partId,
    standardReferenceId: r.standardReferenceId,
    paperSectionId: `${r.paperId}.${r.sectionId ?? "0"}`,
    paperSectionParagraphId: `${r.paperId}.${r.sectionId ?? "0"}.${r.paragraphId}`,
    paragraphId: r.paragraphId,
    sortId: r.sortId,
    language: "eng",
    type: "paragraph",
    typeRank: 0,
    _highlightResult: {
      htmlText: {
        value: r.htmlText,
      },
    },
  };
}
