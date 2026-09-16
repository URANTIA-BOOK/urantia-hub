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
  isReaderLang,
  readStoredReadingLanguage,
  writeStoredReadingLanguage,
  type ReaderLang,
} from "@/libs/readingLanguage";
import { fetchLanguages } from "@/libs/urantiaApi/client";
import { READER_LANGS } from "@/libs/readingLanguage";

type ReaderLangOption = (typeof READER_LANGS)[number];

type ReadingLanguageContextValue = {
  language: ReaderLang;
  ready: boolean;
  availableLangs: readonly ReaderLangOption[];
  setLanguage: (language: ReaderLang) => void;
};

const ReadingLanguageContext = createContext<ReadingLanguageContextValue>({
  language: "eng",
  ready: false,
  availableLangs: READER_LANGS,
  setLanguage: () => {},
});

export const ReadingLanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { status } = useSession();
  const [language, setLanguageState] = useState<ReaderLang>("eng");
  const [ready, setReady] = useState(false);
  const [availableLangs, setAvailableLangs] =
    useState<readonly ReaderLangOption[]>(READER_LANGS);
  const accountSynced = useRef(false);

  useEffect(() => {
    const stored = readStoredReadingLanguage();
    const detected = detectNavigatorLanguage();
    if (stored) setLanguageState(stored);
    else if (detected) setLanguageState(detected);
    setReady(true);
    const htmlLang = (stored ?? detected ?? "eng") === "eng" ? "en" : stored ?? detected;
    if (htmlLang) document.documentElement.lang = htmlLang;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchLanguages()
      .then((langs) => {
        if (cancelled) return;
        const live = new Set(
          langs
            .filter((item) => item.code === "eng" || item.paragraphCount > 0)
            .map((item) => item.code)
        );
        setAvailableLangs(READER_LANGS.filter((item) => live.has(item.code)));
      })
      .catch(() => {
        if (!cancelled) setAvailableLangs(READER_LANGS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStoredReadingLanguage(language);
    document.documentElement.lang = language === "eng" ? "en" : language;
  }, [language, ready]);

  useEffect(() => {
    if (!ready || status !== "authenticated" || accountSynced.current) return;
    let cancelled = false;
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (cancelled || !user) return;
        accountSynced.current = true;
        if (isReaderLang(user.readingLanguage)) {
          setLanguageState(user.readingLanguage);
          writeStoredReadingLanguage(user.readingLanguage);
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
  }, [language, ready, status]);

  const setLanguage = useCallback(
    (next: ReaderLang) => {
      setLanguageState((current) => {
        if (current === next) return current;
        writeStoredReadingLanguage(next);
        return next;
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
    [status]
  );

  return (
    <ReadingLanguageContext.Provider
      value={{ language, ready, availableLangs, setLanguage }}
    >
      {children}
    </ReadingLanguageContext.Provider>
  );
};

export const useReadingLanguage = () => useContext(ReadingLanguageContext);
