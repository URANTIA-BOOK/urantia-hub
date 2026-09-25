// Node modules.
import Link from "next/link";
// Relative modules.
import { useReadingLanguage } from "@/context/readingLanguage";
import { paperHref } from "@/libs/readingFlow";
import { paperLabelsLookup } from "@/utils/paperLabels";

const PaperCard = ({
  nextGlobalId,
  paperId,
  paperTitle,
  progress,
}: {
  nextGlobalId?: string;
  paperId: string;
  paperTitle: string;
  progress: number;
}) => {
  const { language, source } = useReadingLanguage();
  const isCompleted = progress === 100;
  const isNotStarted = progress === 0;

  // Classes for progress bar color and completion
  const progressClasses = isNotStarted
    ? "bg-gray-200 dark:bg-zinc-600"
    : isCompleted
    ? "bg-emerald-500 dark:bg-gradient-to-r dark:from-purple-400 dark:via-pink-500 dark:to-red-500"
    : "bg-gray-400 dark:bg-white";

  return (
    <Link
      aria-label="Read paper"
      className="flex flex-col justify-between px-4 py-2 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 rounded transition-colors hover:no-underline hover:shadow-lg hover:dark:shadow-none transition-shadow duration-300"
      href={paperHref(
        paperId,
        progress > 0 && progress < 100 && !nextGlobalId?.endsWith("0.1")
          ? nextGlobalId
          : null,
        language,
        source
      )}
    >
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">Paper {paperId}</span>
        <h3 className="mt-1 text-lg font-bold mb-1 text-gray-600 dark:text-white">
          {paperTitle}
        </h3>
      </div>
      <div className="flex flex-col">
        <span
          className="text-xs text-gray-400 truncate w-full"
          title={paperLabelsLookup[paperId as keyof typeof paperLabelsLookup]
            .sort()
            .join(" | ")}
        >
          {paperLabelsLookup[paperId as keyof typeof paperLabelsLookup]
            .sort()
            .join(" | ")}
        </span>

        <div className="flex flex-col mt-1.5">
          <div className="bg-gray-200 dark:bg-zinc-600 rounded-full h-2.5 w-full relative mb-1">
            <div
              className={`absolute h-2.5 rounded-full ${progressClasses}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {progress < 100 && (
            <div className="text-gray-400 dark:text-white text-xs">
              Continue Reading{" "}
              {progress < 100 ? ` (${progress.toFixed(0)}%)` : ""}
            </div>
          )}

          {isCompleted && (
            <div className="text-green-500 dark:text-green-400 text-xs mt-0.5">
              Completed (100%)
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PaperCard;
