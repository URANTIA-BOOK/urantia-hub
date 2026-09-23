import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import de from "@/locales/de.json";
import eng from "@/locales/eng.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";

export type UiCopy = typeof eng;

const COPY: Record<string, UiCopy> = { eng, es, fr, de };

export function getUiCopy(language: string): UiCopy {
  return COPY[language] ?? COPY.eng;
}

export function localeKeys(language = "eng"): string[] {
  return Object.keys(getUiCopy(language)).sort();
}

/** English until a known ?lang= or the stored reading language says otherwise. */
export function useUiCopy(): UiCopy {
  const router = useRouter();
  const [language, setLanguage] = useState("eng");

  useEffect(() => {
    const fromQuery =
      typeof router.query.lang === "string" ? router.query.lang : "";
    const stored = window.localStorage.getItem("readingLanguage") ?? "";
    const next = COPY[fromQuery] ? fromQuery : COPY[stored] ? stored : "eng";
    setLanguage(next);
  }, [router.query.lang]);

  return getUiCopy(language);
}
