import { useSession } from "next-auth/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  detectNavigatorLanguage,
  htmlLangAttr,
  isLanguageCode,
  readStoredReadingLanguage,
  readStoredReadingSource,
  resolveSourceId,
  writeStoredReadingLanguage,
  writeStoredReadingSource,
  ENGLISH_LANG,
  type ReaderLangOption,
} from "@/libs/readingLanguage";
import { fetchLanguages } from "@/libs/urantiaApi/client";

type ReadingLanguageContextValue = {
  language: string;
  source: string | null;
  ready: boolean;
  availableLangs: readonly ReaderLangOption[];
  setLanguage: (language: string, sourceId?: string | null) => void;
};

const ReadingLanguageContext = createContext<ReadingLanguageContextValue>({
  language: "eng",
  source: null,
  ready: false,
  availableLangs: [ENGLISH_LANG],
  setLanguage: () => {},
});

function optionsFromApi(
  langs: Awaited<ReturnType<typeof fetchLanguages>>
): ReaderLangOption[] {
  return langs
    .filter((item) => item.code === "eng" || item.paragraphCount > 0)
    .map((item) => ({
      code: item.code,
      slug: item.slug,
      bcp47: item.bcp47,
      label: item.uiLabel || item.name,
      uiLabelEnglish: item.uiLabelEnglish,
      sources: (item.sources ?? [])
        .filter((source) => item.code === "eng" || source.paragraphCount > 0)
        .map((source) => ({
        id: source.id,
        treeSlug: source.treeSlug,
        editionEnglish: source.editionEnglish,
        editionNative: source.editionNative,
        bookTitle: source.bookTitle,
        regionCode: source.regionCode,
        versionNumber: source.versionNumber,
        firstPublished: source.firstPublished,
        copyrightYear: source.copyrightYear,
        isPrimary: source.isPrimary,
      })),
    }));
}

export const ReadingLanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { status } = useSession();
  const [language, setLanguageState] = useState("eng");
  const [source, setSourceState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [availableLangs, setAvailableLangs] = useState<
    readonly ReaderLangOption[]
  >([ENGLISH_LANG]);
  const accountSynced = useRef(false);

  useEffect(() => {
    const stored = readStoredReadingLanguage();
    const storedSource = readStoredReadingSource();
    if (stored) setLanguageState(stored);
    if (storedSource) setSourceState(storedSource);
    setReady(true);
    document.documentElement.lang = htmlLangAttr(stored ?? "eng");
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchLanguages()
      .then((langs) => {
        if (cancelled) return;
        const options = optionsFromApi(langs);
        const next = options.length ? options : [ENGLISH_LANG];
        setAvailableLangs(next);
        const stored = readStoredReadingLanguage();
        const storedSource = readStoredReadingSource();
        const detected = detectNavigatorLanguage(next);
        const codes = new Set(next.map((item) => item.code));
        if (stored && codes.has(stored)) {
          setLanguageState(stored);
          setSourceState(resolveSourceId(next, stored, storedSource));
          return;
        }
        if (detected && codes.has(detected)) {
          setLanguageState(detected);
          const nextSource = resolveSourceId(next, detected);
          setSourceState(nextSource);
          writeStoredReadingLanguage(detected);
          writeStoredReadingSource(nextSource);
        }
      })
      .catch(() => {
        if (!cancelled) setAvailableLangs([ENGLISH_LANG]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStoredReadingLanguage(language);
    writeStoredReadingSource(source);
    document.documentElement.lang = htmlLangAttr(language, availableLangs);
  }, [language, source, ready, availableLangs]);

  useEffect(() => {
    if (!ready || status !== "authenticated" || accountSynced.current) return;
    let cancelled = false;
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (cancelled || !user) return;
        accountSynced.current = true;
        const preferred = user.readingLanguage;
        const codes = new Set(availableLangs.map((item) => item.code));
        if (isLanguageCode(preferred) && codes.has(preferred)) {
          setLanguageState(preferred);
          writeStoredReadingLanguage(preferred);
          const nextSource = resolveSourceId(
            availableLangs,
            preferred,
            readStoredReadingSource()
          );
          setSourceState(nextSource);
          writeStoredReadingSource(nextSource);
          return;
        }
        const stored = readStoredReadingLanguage() ?? language;
        return fetch("/api/user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingLanguage: stored }),
        });
      })
      .catch((error) => {
        console.error("[readingLanguage] account preference failed", error);
      });
    return () => {
      cancelled = true;
    };
  }, [language, ready, status, availableLangs]);

  const setLanguage = useCallback(
    (next: string, sourceId?: string | null) => {
      const nextSource = resolveSourceId(availableLangs, next, sourceId);
      setLanguageState((current) => {
        if (current === next) return current;
        writeStoredReadingLanguage(next);
        return next;
      });
      setSourceState((current) => {
        if (current === nextSource) return current;
        writeStoredReadingSource(nextSource);
        return nextSource;
      });
      if (status === "authenticated") {
        fetch("/api/user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingLanguage: next }),
        }).catch((error) => {
          console.error("[readingLanguage] account save failed", error);
        });
      }
    },
    [availableLangs, status]
  );

  return (
    <ReadingLanguageContext.Provider
      value={{ language, source, ready, availableLangs, setLanguage }}
    >
      {children}
    </ReadingLanguageContext.Provider>
  );
};

export const useReadingLanguage = () => useContext(ReadingLanguageContext);
