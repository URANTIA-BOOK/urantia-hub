import { useEffect, useState } from "react";
import { useReadingLanguage } from "@/context/readingLanguage";
import { fetchToc } from "@/libs/urantiaApi/client";

export type TocLike = {
  paperId?: string;
  paperTitle?: string;
  partId?: string;
  partTitle?: string;
  type?: string;
};

export function overlayTranslatedToc<T extends TocLike>(
  source: T[],
  overlay: TocLike[]
): T[] {
  const paperTitles = new Map<string, string>();
  const partTitles = new Map<string, string>();
  for (const node of overlay) {
    if (node.paperId && node.paperTitle) {
      paperTitles.set(node.paperId, node.paperTitle);
    }
    if (node.type === "part" && node.partId && node.partTitle) {
      partTitles.set(node.partId, node.partTitle);
    }
  }
  if (paperTitles.size === 0 && partTitles.size === 0) return source;
  return source.map((node) => {
    const paperTitle = node.paperId ? paperTitles.get(node.paperId) : undefined;
    const partTitle =
      node.type === "part" && node.partId
        ? partTitles.get(node.partId)
        : undefined;
    if (!paperTitle && !partTitle) return node;
    return {
      ...node,
      ...(paperTitle ? { paperTitle } : {}),
      ...(partTitle ? { partTitle } : {}),
    };
  });
}

export function useTranslatedToc<T extends TocLike>(sourceNodes: T[]): {
  nodes: T[];
  loading: boolean;
} {
  const { language, source, ready } = useReadingLanguage();
  const [overlay, setOverlay] = useState<TocLike[] | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (language === "eng") {
      setOverlay(null);
      setPending(false);
      return;
    }
    let cancelled = false;
    setPending(true);
    fetchToc(language, source)
      .then((nodes) => {
        if (!cancelled) setOverlay(nodes);
      })
      .catch((error) => {
        console.error("[toc] overlay failed", error);
        if (!cancelled) setOverlay(null);
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language, ready, source]);

  return {
    nodes: overlay ? overlayTranslatedToc(sourceNodes, overlay) : sourceNodes,
    loading: !ready || pending,
  };
}
