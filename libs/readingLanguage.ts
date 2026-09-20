export const READING_LANGUAGE_KEY = "readingLanguage";
export const READING_SOURCE_KEY = "readingSource";

export type ReaderSource = {
	id: string;
	treeSlug: string;
	editionEnglish?: string | null;
	editionNative?: string | null;
	bookTitle?: string | null;
	regionCode?: string | null;
	versionNumber?: string | null;
	firstPublished?: number | null;
	copyrightYear?: number | null;
	isPrimary: boolean;
};

export type ReaderLangOption = {
	code: string;
	slug?: string;
	bcp47?: string;
	label: string;
	uiLabelEnglish?: string;
	sources?: ReaderSource[];
};

export const ENGLISH_LANG: ReaderLangOption = {
	code: "eng",
	slug: "eng",
	bcp47: "en",
	label: "English",
	uiLabelEnglish: "English",
};

export function isLanguageCode(value: unknown): value is string {
	return typeof value === "string" && /^[a-z]{2,8}$/.test(value);
}

export function isSourceId(value: unknown): value is string {
	return typeof value === "string" && /^[A-Za-z0-9._:-]{3,120}$/.test(value);
}

export function htmlLangAttr(
	code: string,
	langs: readonly ReaderLangOption[] = [ENGLISH_LANG],
): string {
	const match = langs.find((item) => item.code === code);
	if (match?.bcp47) return match.bcp47;
	if (code === "eng") return "en";
	return code;
}

export function readStoredReadingLanguage(): string | null {
	if (typeof window === "undefined") return null;
	const stored = window.localStorage.getItem(READING_LANGUAGE_KEY);
	return isLanguageCode(stored) ? stored : null;
}

export function writeStoredReadingLanguage(language: string): void {
	if (typeof window === "undefined") return;
	if (!isLanguageCode(language)) return;
	if (window.localStorage.getItem(READING_LANGUAGE_KEY) === language) return;
	window.localStorage.setItem(READING_LANGUAGE_KEY, language);
}

export function readStoredReadingSource(): string | null {
	if (typeof window === "undefined") return null;
	const stored = window.localStorage.getItem(READING_SOURCE_KEY);
	return isSourceId(stored) ? stored : null;
}

export function writeStoredReadingSource(sourceId: string | null): void {
	if (typeof window === "undefined") return;
	if (!sourceId) {
		window.localStorage.removeItem(READING_SOURCE_KEY);
		return;
	}
	if (!isSourceId(sourceId)) return;
	if (window.localStorage.getItem(READING_SOURCE_KEY) === sourceId) return;
	window.localStorage.setItem(READING_SOURCE_KEY, sourceId);
}

export function detectBrowserLanguage(
	input?: string | null,
	langs: readonly ReaderLangOption[] = [ENGLISH_LANG],
): string | null {
	const raw = (input ?? "").toLowerCase();
	if (!raw) return null;
	const prefix = raw.split("-")[0];
	const match = langs.find(
		(item) =>
			item.code === prefix ||
			item.slug === prefix ||
			item.bcp47 === prefix ||
			(prefix === "en" && item.code === "eng"),
	);
	return match?.code ?? null;
}

export function detectNavigatorLanguage(
	langs?: readonly ReaderLangOption[],
): string | null {
	if (typeof navigator === "undefined") return null;
	return detectBrowserLanguage(navigator.language, langs);
}

export function primarySource(
	lang?: ReaderLangOption | null,
): ReaderSource | undefined {
	const sources = lang?.sources ?? [];
	return sources.find((source) => source.isPrimary) ?? sources[0];
}

export function resolveSource(
	lang?: ReaderLangOption | null,
	sourceId?: string | null,
): ReaderSource | undefined {
	const sources = lang?.sources ?? [];
	if (sourceId) {
		const match = sources.find((source) => source.id === sourceId);
		if (match) return match;
	}
	return primarySource(lang);
}

export function resolveSourceId(
	langs: readonly ReaderLangOption[],
	language: string,
	sourceId?: string | null,
): string | null {
	if (language === "eng") return null;
	const lang = langs.find((item) => item.code === language);
	if (!lang) return sourceId && isSourceId(sourceId) ? sourceId : null;
	return resolveSource(lang, sourceId)?.id ?? null;
}

export function sourceStamp(source?: ReaderSource | null): string {
	if (!source) return "";
	const year =
		typeof source.firstPublished === "number" && source.firstPublished > 0
			? `(${source.firstPublished})`
			: "";
	const version = source.versionNumber ? `v${source.versionNumber}` : "";
	if (year && version) return `${year} | ${version}`;
	return year || version;
}

export type SourceDetailCard = {
	title: string | null;
	tag: string | null;
	edition: string | null;
	year: number | null;
	version: string | null;
	id: string;
};

/** Version-table fields for the details card (metadata.json via translation_sources). */
export function sourceDetailCard(
	source?: ReaderSource | null,
): SourceDetailCard | null {
	if (!source) return null;
	const title = source.bookTitle?.trim() || null;
	const tag = source.editionNative?.trim() || null;
	const edition = source.editionEnglish?.trim() || null;
	return {
		title,
		tag: tag && tag !== title ? tag : null,
		edition: edition && edition !== title && edition !== tag ? edition : null,
		year:
			typeof source.firstPublished === "number" && source.firstPublished > 0
				? source.firstPublished
				: null,
		version: source.versionNumber?.trim() || null,
		id: source.id,
	};
}

/** Flat identity lines — tests and anything that still wants a list. */
export function sourceDetailLines(source?: ReaderSource | null): string[] {
	const card = sourceDetailCard(source);
	if (!card) return [];
	return [card.title, card.tag, card.edition, sourceStamp(source), card.id].filter(
		(value): value is string => Boolean(value),
	);
}

export function isHoverPointer(pointerType?: string | null): boolean {
	return pointerType !== "touch";
}

export function languageRowAction(input: {
	hasEditions: boolean;
	pointerType?: string | null;
	revealed: boolean;
	detailsInline?: boolean;
}): "reveal" | "activate" {
	if (
		input.hasEditions &&
		!input.revealed &&
		(input.detailsInline || !isHoverPointer(input.pointerType))
	) {
		return "reveal";
	}
	return "activate";
}

export function editionRowAction(
	pointerType?: string | null,
	detailsVisible = false,
): "preview" | "activate" {
	if (detailsVisible) return "activate";
	return isHoverPointer(pointerType) ? "activate" : "preview";
}

/**
 * Popover is the hover catalog (side details). Reader chrome has no side
 * panes — one sheet. Phone and coarse pointers also get the sheet.
 */
export function pickerSurface(input: {
	finePointer: boolean;
	wide: boolean;
	hoverPanes?: boolean;
}): "popover" | "sheet" {
	if (input.hoverPanes === false) return "sheet";
	return input.finePointer && input.wide ? "popover" : "sheet";
}

export function overlaySearch(
	lang?: string | null,
	source?: string | null,
): string {
	const params = new URLSearchParams();
	if (lang && lang !== "eng") params.set("lang", lang);
	if (source) params.set("source", source);
	const qs = params.toString();
	return qs ? `?${qs}` : "";
}
