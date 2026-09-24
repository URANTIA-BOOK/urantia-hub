import { Calendar, Check, ChevronLeft, ChevronRight, Globe, Pencil, Tag } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "@/components/Modal";
import { useReadingLanguage } from "@/context/readingLanguage";
import { paperHref } from "@/libs/readingFlow";
import {
  ENGLISH_LANG,
  showLanguageControl,
  editionRowAction,
  languageRowAction,
  pickerSurface,
  primarySource,
  resolveSource,
  sourceDetailCard,
  sourceStamp,
  type ReaderLangOption,
  type ReaderSource,
} from "@/libs/readingLanguage";

type ReadingLanguageNavProps = {
  paperId?: string;
  tone?: "hero" | "reader";
  variant?: "dropdown" | "fab";
};

const reset =
  "appearance-none shadow-none focus:outline-none";
const chrome = `${reset} border-0 bg-transparent dark:border-0 dark:bg-transparent`;

const rowTone = (active: boolean) =>
  active
    ? "bg-sky-50 text-sky-700 dark:bg-white/10 dark:text-sky-300"
    : "bg-transparent text-gray-700 hover:bg-black/[0.04] dark:bg-transparent dark:text-gray-200 dark:hover:bg-white/10";

function useFinePointer() {
  const [fine, setFine] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return fine;
}

function useWideViewport() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const sync = () => setWide(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return wide;
}

function SourceDetails({
  source,
  label,
  actionLabel,
  onHold,
  onAccept,
}: {
  source: ReaderSource;
  label: string;
  actionLabel?: string;
  onHold: () => void;
  onAccept?: () => void;
}) {
  const card = sourceDetailCard(source);
  if (!card) return null;
  return (
    <aside
      className="w-72 rounded-2xl bg-white px-4 py-3 shadow-xl dark:bg-neutral-800"
      onMouseEnter={onHold}
      role="note"
      aria-label={label}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      {card.title ? (
        <p className="mt-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
          {card.title}
        </p>
      ) : null}
      {card.tag ? (
        <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-200">
          {card.tag}
        </span>
      ) : null}
      {card.edition ? (
        <p className="mt-2 text-xs leading-snug text-gray-500 dark:text-gray-400">
          {card.edition}
        </p>
      ) : null}
      {card.year || card.version ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {card.year ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar aria-hidden className="h-3.5 w-3.5" />
              {card.year}
            </span>
          ) : null}
          {card.version ? (
            <span className="inline-flex items-center gap-1.5">
              <Tag aria-hidden className="h-3.5 w-3.5" />
              v{card.version}
            </span>
          ) : null}
        </div>
      ) : null}
      <p className="mt-2 font-mono text-[10px] tracking-tight text-gray-400">
        {card.id}
      </p>
      {onAccept && actionLabel ? (
        <button
          className={`${chrome} mt-3 w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white dark:bg-sky-500 dark:px-3 dark:py-2`}
          onClick={(event) => {
            event.stopPropagation();
            onAccept();
          }}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </aside>
  );
}

function EditOverlay({
  editLabel,
  showEdit,
  editing,
  onEdit,
}: {
  editLabel: string;
  showEdit: boolean;
  editing: boolean;
  onEdit: () => void;
}) {
  return (
    <button
      aria-expanded={editing}
      aria-label={editLabel}
      className={`${chrome} absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full p-0 transition-opacity dark:p-0 ${
        editing
          ? "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300"
          : "bg-white text-gray-500 dark:bg-neutral-600 dark:text-gray-100"
      } ${showEdit ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onEdit();
      }}
      type="button"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

const ReadingLanguageNav = ({
  paperId,
  tone = "reader",
  variant = "dropdown",
}: ReadingLanguageNavProps) => {
  const router = useRouter();
  const copy = {
    language: "Language",
    editEdition: "Edit edition",
    editionDetails: "Edition",
    useEdition: "Use this edition",
  };
  const finePointer = useFinePointer();
  const wide = useWideViewport();
  const surface = pickerSurface({
    finePointer,
    wide,
    hoverPanes: variant !== "fab",
  });
  const { language, source, languages, setLanguage } = useReadingLanguage();
  const langs = languages.length ? languages : [ENGLISH_LANG];
  const current = langs.find((item) => item.code === language) ?? langs[0];
  const [open, setOpen] = useState(false);
  const [editionLang, setEditionLang] = useState<string | null>(null);
  const [detailSource, setDetailSource] = useState<ReaderSource | null>(null);
  const [revealEdit, setRevealEdit] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<ReaderSource | null>(null);
  const pointerTypeRef = useRef("mouse");
  const rootRef = useRef<HTMLDivElement>(null);
  const editionItem = langs.find((item) => item.code === editionLang);
  const editions = editionItem?.sources ?? [];
  const sheet = surface === "sheet";

  const showDetails = (next?: ReaderSource | null) => {
    setDetailSource(next ?? null);
  };

  const closePicker = () => {
    setOpen(false);
    setEditionLang(null);
    setDetailSource(null);
    setRevealEdit(null);
    setPreviewSource(null);
  };

  useEffect(() => {
    if (!open || sheet) {
      if (!open) {
        setEditionLang(null);
        setDetailSource(null);
        setRevealEdit(null);
        setPreviewSource(null);
      }
      return;
    }
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (previewSource) setPreviewSource(null);
      else if (detailSource) setDetailSource(null);
      else if (editionLang) setEditionLang(null);
      else setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [detailSource, editionLang, open, previewSource, sheet]);

  const navigatePaper = (nextLanguage: string, nextSource?: string | null) => {
    if (!paperId) return;
    void router.replace(
      paperHref(paperId, null, nextLanguage, nextSource),
      undefined,
      { shallow: true }
    );
  };

  const onSelectLanguage = (item: ReaderLangOption) => {
    const nextSource =
      language === item.code
        ? (source ?? primarySource(item)?.id ?? null)
        : (primarySource(item)?.id ?? null);
    setLanguage(item.code, nextSource);
    closePicker();
    navigatePaper(item.code, nextSource);
  };

  const onEditEditions = (item: ReaderLangOption) => {
    setEditionLang((currentCode) =>
      currentCode === item.code ? null : item.code
    );
    setPreviewSource(null);
    showDetails(
      language === item.code
        ? resolveSource(item, source)
        : primarySource(item)
    );
  };

  const onSelectSource = (item: ReaderLangOption, next: ReaderSource) => {
    setLanguage(item.code, next.id);
    closePicker();
    navigatePaper(item.code, next.id);
  };

  const isHero = tone === "hero";
  const triggerClass =
    variant === "fab"
      ? `${chrome} inline-flex h-12 min-w-12 shrink-0 items-center justify-center gap-1 rounded-full bg-slate-100 px-3 text-sm text-gray-700 dark:bg-neutral-700 dark:px-3 dark:text-white`
      : isHero
        ? `${reset} inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20 dark:border-white/30 dark:bg-white/10 dark:px-3 dark:py-1`
        : `${reset} inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-700 dark:px-3 dark:py-1 dark:text-white dark:hover:bg-neutral-600`;

  const menuClass =
    "w-max overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-black/10 dark:bg-neutral-700 dark:ring-white/10";
  const editionClass =
    "w-max overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-black/10 dark:bg-neutral-700 dark:ring-white/10";

  const languageRows = langs.map((item) => {
    const selectedSource =
      language === item.code
        ? resolveSource(item, source)
        : primarySource(item);
    const stamp = sourceStamp(selectedSource);
    const hasEditions = (item.sources ?? []).length > 1;
    const editing = editionLang === item.code;
    const showEdit =
      !sheet && hasEditions && (revealEdit === item.code || editing);
    return (
      <div
        key={item.code}
        className="relative"
        onMouseEnter={() => {
          if (!finePointer || sheet) return;
          setRevealEdit(hasEditions ? item.code : null);
          showDetails(selectedSource);
        }}
      >
        <button
          className={`${chrome} flex w-full min-h-12 items-center gap-2 px-4 py-3 text-left text-sm cursor-pointer dark:px-4 dark:py-3 ${rowTone(
            language === item.code
          )}`}
          onClick={(event) => {
            const pointerType =
              event.detail === 0 ? "mouse" : pointerTypeRef.current;
            const next = languageRowAction({
              hasEditions,
              pointerType,
              revealed: revealEdit === item.code || editing,
              detailsInline: sheet,
            });
            if (next === "reveal") {
              setRevealEdit(item.code);
              showDetails(selectedSource);
              if (sheet) setEditionLang(item.code);
              return;
            }
            onSelectLanguage(item);
          }}
          role="option"
          aria-selected={language === item.code}
          type="button"
        >
          <span className="min-w-0 flex-1 truncate font-medium">
            {item.label}
          </span>
          {stamp ? (
            <span className="shrink-0 text-xs tabular-nums text-gray-400">
              {stamp}
            </span>
          ) : null}
          {hasEditions && sheet ? (
            <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-gray-400" />
          ) : null}
        </button>
        {hasEditions && !sheet ? (
          <EditOverlay
            editLabel={copy.editEdition}
            editing={editing}
            onEdit={() => onEditEditions(item)}
            showEdit={showEdit}
          />
        ) : null}
      </div>
    );
  });

  const editionRows =
    editionItem && editions.length > 1
      ? editions.map((item) => {
          const selected =
            language === editionItem.code && source === item.id;
          const previewed = previewSource?.id === item.id;
          const stamp = sourceStamp(item);
          const card = sourceDetailCard(item);
          return (
            <button
              key={item.id}
              className={`${chrome} flex w-full min-h-12 items-start justify-between gap-3 px-4 py-3 text-left text-sm cursor-pointer dark:px-4 dark:py-3 ${rowTone(
                selected || previewed
              )}`}
              onMouseEnter={() => {
                if (!finePointer || sheet) return;
                setPreviewSource(null);
                showDetails(item);
              }}
              onClick={(event) => {
                event.stopPropagation();
                const pointerType =
                  event.detail === 0 ? "mouse" : pointerTypeRef.current;
                if (
                  editionRowAction(pointerType, sheet) === "preview"
                ) {
                  setPreviewSource(item);
                  showDetails(item);
                  return;
                }
                onSelectSource(editionItem, item);
              }}
              role="option"
              aria-selected={selected}
              type="button"
            >
              <span className="min-w-0">
                {sheet && card?.title ? (
                  <span className="block font-medium text-gray-900 dark:text-white">
                    {card.title}
                  </span>
                ) : null}
                <span className="block font-medium tabular-nums text-gray-600 dark:text-gray-200">
                  {stamp || item.id}
                </span>
                {sheet && card?.edition ? (
                  <span className="mt-1 block text-xs leading-snug text-gray-400">
                    {card.edition}
                  </span>
                ) : null}
              </span>
              {selected ? <Check className="mt-1 h-4 w-4 shrink-0" /> : null}
            </button>
          );
        })
      : null;

  const trigger = (
    <button
      aria-expanded={open}
      aria-haspopup={sheet ? "dialog" : "listbox"}
      aria-label={copy.language}
      className={`${triggerClass} cursor-pointer`}
      onClick={() => setOpen((value) => !value)}
      type="button"
    >
      <Globe className={variant === "fab" ? "h-5 w-5" : "h-4 w-4"} />
      <span className="font-medium tracking-wide">
        {current?.code === "eng" ? "EN" : current?.code.toUpperCase()}
      </span>
    </button>
  );

  if (!showLanguageControl(languages)) return null;

  return (
    <div className="relative z-20" ref={rootRef}>
      {trigger}
      {open && sheet && typeof document !== "undefined"
        ? createPortal(
        <Modal onClose={closePicker}>
          <div className="flex max-h-[85vh] min-h-0 flex-col px-2 pb-3 pt-3">
            <div className="mb-2 flex shrink-0 items-center gap-1 pr-12">
              {editionItem ? (
                <button
                  className={`${chrome} inline-flex h-12 w-auto shrink-0 items-center gap-1 px-2 text-sm text-sky-700 dark:px-2 dark:text-sky-300`}
                  onClick={() => {
                    setEditionLang(null);
                    setPreviewSource(null);
                  }}
                  type="button"
                >
                  <ChevronLeft aria-hidden className="h-4 w-4" />
                  {copy.language}
                </button>
              ) : null}
              <h2 className="min-w-0 flex-1 px-2 text-xl text-gray-900 dark:text-white">
                {editionItem ? copy.editionDetails : copy.language}
              </h2>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto"
              role="listbox"
              aria-label={editionItem ? copy.editEdition : copy.language}
              onPointerDown={(event) => {
                pointerTypeRef.current = event.pointerType;
              }}
            >
              {editionItem ? editionRows : languageRows}
            </div>
          </div>
        </Modal>,
        document.body
        )
      : null}
      {open && !sheet ? (
        <div
          className="absolute right-0 top-full z-20 mt-2 flex items-start gap-2"
          onPointerDown={(event) => {
            pointerTypeRef.current = event.pointerType;
          }}
          onMouseLeave={() => {
            if (!finePointer) return;
            if (!editionLang) setRevealEdit(null);
            setDetailSource(null);
            setPreviewSource(null);
          }}
        >
          {detailSource ? (
            <SourceDetails
              source={detailSource}
              label={copy.editionDetails}
              actionLabel={copy.useEdition}
              onHold={() => showDetails(detailSource)}
              onAccept={
                !finePointer && editionItem && detailSource
                  ? () =>
                      onSelectSource(
                        editionItem,
                        previewSource ?? detailSource
                      )
                  : undefined
              }
            />
          ) : null}
          {editionRows ? (
            <div
              className={editionClass}
              role="listbox"
              aria-label={copy.editEdition}
            >
              {editionRows}
            </div>
          ) : null}
          <div className={menuClass} role="listbox" aria-label={copy.language}>
            {languageRows}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReadingLanguageNav;
