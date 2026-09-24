import { useEffect, useState } from "react";
import { fetchToc } from "@/libs/urantiaApi/client";

type ServedEdition = {
  lang?: string | null;
  source?: string | null;
};

/** Server nodes until the selected edition differs, then the catalog for that edition. */
export function useEditionToc<T>(
  serverNodes: T[],
  served: ServedEdition | undefined,
  language: string,
  source: string | null,
  ready: boolean
): T[] {
  const [overlay, setOverlay] = useState<T[] | null>(null);
  const servedLang = served?.lang || "eng";
  const matches =
    servedLang === language &&
    (language === "eng" || !source || (served?.source ?? null) === source);

  useEffect(() => {
    if (!ready || matches) {
      setOverlay(null);
      return;
    }
    let cancelled = false;
    const requestLang = language === "eng" ? null : language;
    const requestSource = language === "eng" ? null : source;
    fetchToc(requestLang, requestSource)
      .then((rows) => {
        if (!cancelled) setOverlay(rows as T[]);
      })
      .catch((error) => {
        console.error(`[toc] overlay failed for lang=${language}:`, error);
      });
    return () => {
      cancelled = true;
    };
  }, [language, matches, ready, source]);

  return overlay ?? serverNodes;
}
