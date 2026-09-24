import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

  useEffect(() => {
    const stored = readStoredReadingLanguage();
    const storedSource = readStoredReadingSource();
    if (stored) {
      setLanguageState(stored);
      setSourceState(storedSource);
      writeReadingCookies(stored, storedSource);
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
  const shownLanguage = isLanguageCode(queryLang) ? queryLang : language;
  const shownSource = isLanguageCode(queryLang)
    ? resolveSourceId(
        languages,
        queryLang,
        isSourceId(querySource) ? querySource : source
      )
    : source;

  return (
    <ReadingLanguageContext.Provider
      value={{
        languages,
        language: shownLanguage,
        source: shownSource,
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
