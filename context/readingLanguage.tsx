import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { fetchLanguages } from "@/libs/urantiaApi/client";
import type { ApiLanguage } from "@/libs/urantiaApi/types";
import {
  ENGLISH_LANG,
  isLanguageCode,
  isSourceId,
  primarySourceId,
  readStoredReadingLanguage,
  readStoredReadingSource,
  resolveSourceId,
  writeReadingCookies,
  writeStoredReadingLanguage,
  writeStoredReadingSource,
  type ReaderLangOption,
} from "@/libs/readingLanguage";

type ReadingLanguageContextValue = {
  languages: readonly ReaderLangOption[];
  language: string;
  source: string | null;
  ready: boolean;
  setLanguage: (language: string, sourceId?: string | null) => void;
};

const ReadingLanguageContext = createContext<ReadingLanguageContextValue>({
  languages: [ENGLISH_LANG],
  language: "eng",
  source: null,
  ready: false,
  setLanguage: () => {},
});

function toOption(item: ApiLanguage): ReaderLangOption {
  return {
    code: item.code,
    slug: item.slug,
    bcp47: item.bcp47,
    label: item.uiLabel || item.name || item.code,
    uiLabelEnglish: item.uiLabelEnglish,
    sources: (item.sources ?? []).map((source) => ({
      id: source.id,
      label:
        source.editionNative ||
        source.editionEnglish ||
        source.bookTitle ||
        source.id,
      treeSlug: source.treeSlug,
      editionEnglish: source.editionEnglish,
      editionNative: source.editionNative,
      bookTitle: source.bookTitle,
      regionCode: source.regionCode,
      versionNumber: source.versionNumber,
      firstPublished: source.firstPublished,
      isPrimary: source.isPrimary,
    })),
  };
}

export function ReadingLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [languages, setLanguages] = useState<readonly ReaderLangOption[]>([
    ENGLISH_LANG,
  ]);
  const [language, setLanguageState] = useState("eng");
  const [source, setSourceState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);

  const apply = useCallback(
    (nextLanguage: string, nextSource: string | null, persistAccount: boolean) => {
      const resolved = resolveSourceId(languages, nextLanguage, nextSource);
      setLanguageState(nextLanguage);
      setSourceState(resolved);
      writeStoredReadingLanguage(nextLanguage);
      writeStoredReadingSource(resolved);
      writeReadingCookies(nextLanguage, resolved);
      if (!persistAccount || status !== "authenticated") return;
      void fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readingLanguage: nextLanguage }),
      }).catch(() => {});
    },
    [languages, status]
  );

  // Read the edition before paint. A post-paint effect flashes English,
  // then the stored language, and the page keeps the first copy.
  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get("lang");
    const querySource = params.get("source");
    const stored = readStoredReadingLanguage();
    const storedSource = readStoredReadingSource();
    const next = isLanguageCode(queryLang) ? queryLang : stored;
    const nextSource = isLanguageCode(queryLang)
      ? isSourceId(querySource)
        ? querySource
        : storedSource
      : storedSource;
    if (next) {
      setLanguageState(next);
      setSourceState(next === "eng" ? null : nextSource);
      writeReadingCookies(next, next === "eng" ? null : nextSource);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchLanguages()
      .then((rows) => {
        if (cancelled) return;
        const options = rows.map(toOption);
        setLanguages(options.length ? options : [ENGLISH_LANG]);
        setCatalogReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setLanguages([ENGLISH_LANG]);
          setCatalogReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!catalogReady) return;
    if (!languages.some((item) => item.code === language)) {
      setLanguageState("eng");
      setSourceState(null);
    }
  }, [catalogReady, language, languages]);

  const setLanguage = useCallback(
    (nextLanguage: string, sourceId?: string | null) => {
      if (!isLanguageCode(nextLanguage)) return;
      if (!languages.some((item) => item.code === nextLanguage)) return;
      apply(nextLanguage, sourceId ?? null, true);
    },
    [apply, languages]
  );

  const queryLang =
    typeof router.query.lang === "string" ? router.query.lang : null;
  const querySource =
    typeof router.query.source === "string" ? router.query.source : null;
  const followedQuery = useRef<string | null>(null);

  // Links and the back button carry the edition in the query. A click
  // writes state before the URL updates, so this follows only a new query.
  useEffect(() => {
    if (!ready || !router.isReady) return;
    const mark = isLanguageCode(queryLang)
      ? `${queryLang}:${querySource ?? ""}`
      : "";
    if (followedQuery.current === mark) return;
    followedQuery.current = mark;
    if (!isLanguageCode(queryLang)) return;
    apply(queryLang, isSourceId(querySource) ? querySource : null, false);
  }, [apply, queryLang, querySource, ready, router.isReady]);

  return (
    <ReadingLanguageContext.Provider
      value={{
        languages,
        language,
        source,
        ready,
        setLanguage,
      }}
    >
      {children}
    </ReadingLanguageContext.Provider>
  );
}

export function useReadingLanguage() {
  return useContext(ReadingLanguageContext);
}
