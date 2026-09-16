import { Globe } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useReadingLanguage } from "@/context/readingLanguage";
import { paperPath } from "@/libs/readingFlow";
import { READER_LANGS, type ReaderLang } from "@/libs/readingLanguage";
import { useUiCopy } from "@/libs/uiCopy";

type ReadingLanguageNavProps = {
  paperId?: string;
  tone?: "hero" | "reader";
  variant?: "dropdown" | "fab";
};

const ReadingLanguageNav = ({
  paperId,
  tone = "reader",
  variant = "dropdown",
}: ReadingLanguageNavProps) => {
  const router = useRouter();
  const copy = useUiCopy();
  const { language, availableLangs, setLanguage } = useReadingLanguage();
  const langs = availableLangs.length ? availableLangs : READER_LANGS;
  const current = langs.find((item) => item.code === language) ?? langs[0];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onSelect = (next: ReaderLang) => {
    setLanguage(next);
    setOpen(false);
    if (!paperId) return;
    void router.replace(paperPath(paperId, undefined, next), undefined, {
      shallow: true,
    });
  };

  const isHero = tone === "hero";
  const triggerClass =
    variant === "fab"
      ? "flex h-12 w-12 items-center justify-center rounded-full border-0 bg-white text-gray-700 shadow-lg dark:bg-neutral-700 dark:text-white"
      : isHero
        ? "inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
        : "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600";

  const menuClass =
    variant === "fab"
      ? "absolute bottom-14 right-0 min-w-[10rem] overflow-hidden rounded-xl bg-white py-1 shadow-xl dark:bg-neutral-800"
      : "absolute right-0 top-full z-20 mt-2 min-w-[10rem] overflow-hidden rounded-xl bg-white py-1 shadow-xl dark:bg-neutral-800";

  return (
    <div
      className={
        variant === "fab"
          ? paperId
            ? "fixed bottom-40 right-4 z-20 sm:bottom-36"
            : "fixed bottom-24 right-4 z-20"
          : "relative z-20"
      }
      ref={rootRef}
    >
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={copy.language}
        className={`${triggerClass} appearance-none cursor-pointer`}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Globe className={variant === "fab" ? "h-5 w-5" : "h-4 w-4"} />
        {variant !== "fab" && (
          <span className="font-medium tracking-wide">
            {current?.code === "eng" ? "EN" : current?.code.toUpperCase()}
          </span>
        )}
      </button>
      {open && (
        <div className={menuClass} role="listbox" aria-label={copy.language}>
          {langs.map((item) => (
            <button
              key={item.code}
              className={
                language === item.code
                  ? "block w-full border-0 bg-sky-50 px-4 py-2 text-left text-sm text-sky-700 dark:bg-neutral-700 dark:text-sky-300"
                  : "block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-700"
              }
              onClick={() => onSelect(item.code)}
              role="option"
              aria-selected={language === item.code}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadingLanguageNav;
