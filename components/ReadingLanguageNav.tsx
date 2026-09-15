import { useRouter } from "next/router";
import { useReadingLanguage } from "@/context/readingLanguage";
import { READER_LANGS, type ReaderLang } from "@/libs/readingLanguage";
import { paperIdToUrl } from "@/utils/paperFormatters";

type ReadingLanguageNavProps = {
  paperId?: string;
};

function paperPath(paperId: string, language: ReaderLang) {
  const path = `/papers/${paperIdToUrl(paperId)}`;
  return language === "eng" ? path : `${path}?lang=${encodeURIComponent(language)}`;
}

const ReadingLanguageNav = ({ paperId }: ReadingLanguageNavProps) => {
  const router = useRouter();
  const { language, setLanguage } = useReadingLanguage();

  const onSelect = (next: ReaderLang) => {
    setLanguage(next);
    if (!paperId) return;
    void router.replace(paperPath(paperId, next), undefined, { shallow: true });
  };

  return (
    <nav
      aria-label="Reading language"
      className="flex justify-center gap-3 text-sm"
    >
      {READER_LANGS.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => onSelect(item.code)}
          className={
            language === item.code
              ? "appearance-none text-sky-600 dark:text-sky-400 font-medium bg-transparent border-0 p-0 cursor-pointer"
              : "appearance-none text-gray-400 hover:text-gray-600 hover:dark:text-white transition-all duration-300 bg-transparent border-0 p-0 cursor-pointer"
          }
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default ReadingLanguageNav;
