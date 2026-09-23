import { showLanguageControl } from "@/libs/readingLanguage";
import { useReadingLanguage } from "@/context/readingLanguage";

export function LanguageSelect() {
  const { languages, language, source, setLanguage } = useReadingLanguage();
  if (!showLanguageControl(languages)) return null;

  const current = languages.find((item) => item.code === language);
  const sources = current?.sources ?? [];

  return (
    <span className="inline-flex items-center gap-1">
      <select
        aria-label="Language"
        className="max-w-[7rem] bg-transparent text-current"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
      {sources.length > 1 && (
        <select
          aria-label="Edition"
          className="max-w-[7rem] bg-transparent text-current"
          value={source ?? sources[0]?.id ?? ""}
          onChange={(event) => setLanguage(language, event.target.value)}
        >
          {sources.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      )}
    </span>
  );
}
