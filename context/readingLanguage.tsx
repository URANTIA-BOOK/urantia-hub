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
  isReaderLang,
  readStoredReadingLanguage,
  writeStoredReadingLanguage,
  type ReaderLang,
} from "@/libs/readingLanguage";

type ReadingLanguageContextValue = {
  language: ReaderLang;
  ready: boolean;
  setLanguage: (language: ReaderLang) => void;
};

const ReadingLanguageContext = createContext<ReadingLanguageContextValue>({
  language: "eng",
  ready: false,
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
  const accountSynced = useRef(false);

  useEffect(() => {
    const stored = readStoredReadingLanguage();
    if (stored) setLanguageState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStoredReadingLanguage(language);
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
    <ReadingLanguageContext.Provider value={{ language, ready, setLanguage }}>
      {children}
    </ReadingLanguageContext.Provider>
  );
};

export const useReadingLanguage = () => useContext(ReadingLanguageContext);
