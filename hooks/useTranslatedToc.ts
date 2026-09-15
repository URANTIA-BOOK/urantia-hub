import { useEffect, useState } from "react";
import { useReadingLanguage } from "@/context/readingLanguage";
import { fetchToc } from "@/libs/urantiaApi/client";

type TocLike = {
  paperId?: string;
  paperTitle?: string;
};

function overlayPaperTitles<T extends TocLike>(source: T[], overlay: T[]): T[] {
  const titles = new Map<string, string>();
  for (const node of overlay) {
    if (node.paperId && node.paperTitle) {
      titles.set(node.paperId, node.paperTitle);
    }
  }
  if (titles.size === 0) return source;
  return source.map((node) => {
    if (!node.paperId) return node;
    const paperTitle = titles.get(node.paperId);
    return paperTitle ? { ...node, paperTitle } : node;
  });
}

export function useTranslatedToc<T extends TocLike>(sourceNodes: T[]): {
  nodes: T[];
  loading: boolean;
} {
  const { language, ready } = useReadingLanguage();
  const [overlay, setOverlay] = useState<T[] | null>(null);
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
    fetchToc(language)
      .then((nodes) => {
        if (!cancelled) setOverlay(nodes as T[]);
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
  }, [language, ready]);

  return {
    nodes: overlay ? overlayPaperTitles(sourceNodes, overlay) : sourceNodes,
    loading: !ready || pending,
  };
}
