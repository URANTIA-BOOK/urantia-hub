// Node modules.
import Link from "next/link";
import { useReadingLanguage } from "@/context/readingLanguage";
import { paperPath } from "@/libs/readingFlow";
import { formatPaperTitle, useUiCopy } from "@/libs/uiCopy";

interface PaperNavbarProps {
  audioContent?: JSX.Element;
  audioOnPlay?: () => void;
  audioIsPlaying?: boolean;
  paperId?: number;
  paperTitle?: string;
  showAudio?: boolean;
  skipToPreviousParagraph?: () => void;
  skipToNextParagraph?: () => void;
  setPlaybackRate?: (rate: number) => void;
  playbackRate?: number;
}

const PaperNavbar = ({
  audioContent,
  audioOnPlay,
  audioIsPlaying,
  paperId,
  paperTitle,
  showAudio,
  skipToPreviousParagraph,
  skipToNextParagraph,
  setPlaybackRate,
  playbackRate,
}: PaperNavbarProps) => {
  const copy = useUiCopy();
  const { language } = useReadingLanguage();

  if (paperId === undefined) return null;
  if (!paperTitle) return null;

  const playbackRates = ["0.5", "0.75", "1.0", "1.25", "1.5"];
  const previousId = paperId - 1 === -1 ? "0" : `${paperId - 1}`;
  const nextId = paperId + 1 <= 196 ? `${paperId + 1}` : "196";

  return (
    <div
      className={`flex items-center ${
        audioIsPlaying ? "justify-center" : "justify-between"
      } w-full max-w-3xl mt-1 mb-6`}
    >
      {!audioIsPlaying && (
        <div
          className="flex-grow flex items-center justify-between bg-slate-100 dark:bg-neutral-700 rounded-full w-full"
          style={showAudio ? { maxWidth: "calc(100% - 48px)" } : {}}
        >
          <Link
            aria-label={copy.previousPaper}
            className="px-2 py-2 text-gray-400 hover:text-gray-600 dark:text-white hover:dark:text-white transition duration-300 ease-in-out"
            href={paperPath(previousId, undefined, language)}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
              />
            </svg>
          </Link>
          <Link
            className="flex-1 py-2 text-sm font-bold text-center whitespace-nowrap overflow-hidden text-ellipsis text-gray-600 hover:text-gray-600 dark:text-white hover:dark:text-white hover:no-underline transition duration-300 ease-in-out"
            href={`/papers#${paperId}`}
          >
            {formatPaperTitle(copy, String(paperId), paperTitle)}
          </Link>
          <Link
            aria-label={copy.nextPaperAria}
            className="px-2 py-2 flex text-right justify-end text-gray-400 hover:text-gray-600 dark:text-white hover:dark:text-white transition duration-300 ease-in-out"
            href={paperPath(nextId, undefined, language)}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Play audio button */}
      {showAudio && (
        <div
          className={`flex items-center ${
            audioIsPlaying ? "w-full justify-between" : "ml-2"
          }`}
        >
          {audioIsPlaying ? (
            <>
              {/* Playback speed controls */}
              <div className="flex-1 fade-in">
                <select
                  className="cursor-pointer text-sm appearance-none p-2 pr-4 bg-slate-100 dark:bg-neutral-700 text-gray-400 hover:text-gray-600 dark:text-white hover:dark:text-white rounded-full border-0 focus:outline-none transition duration-300 ease-in-out"
                  onChange={(event) =>
                    setPlaybackRate &&
                    setPlaybackRate(Number(event.target.value))
                  }
                  value={Number(playbackRate)}
                >
                  {playbackRates.map((rate) => (
                    <option key={rate} value={Number(rate)}>
                      {rate}x
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-1 items-center justify-center">
                {/* Previous paragraph button */}
                <button
                  aria-label="Previous paragraph"
                  className="flex-shrink-0 bg-slate-100 dark:bg-neutral-700 text-gray-400 hover:text-gray-600 dark:text-white hover:dark:text-white border-0 rounded-full p-2 focus:outline-none transition duration-300 ease-in-out"
                  onClick={skipToPreviousParagraph}
                  type="button"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M11 19l-7-7 7-7v14zm10 0l-7-7 7-7v14z"
                    />
                  </svg>
                </button>

                {/* Toggle audio play */}
                <button
                  aria-label="Play/pause audio"
                  className="flex-shrink-0 ml-2 bg-slate-100 dark:bg-neutral-700 text-gray-600 dark:text-white hover:dark:text-white border-0 rounded-full p-2 focus:outline-none transition duration-300 ease-in-out"
                  onClick={audioOnPlay}
                  type="button"
                >
                  {audioContent}
                </button>

                {/* Next paragraph button */}
                <button
                  aria-label="Next paragraph"
                  className="flex-shrink-0 bg-slate-100 dark:bg-neutral-700 text-gray-400 hover:text-gray-600 dark:text-white hover:dark:text-white border-0 rounded-full p-2 ml-2 focus:outline-none transition duration-300 ease-in-out"
                  onClick={skipToNextParagraph}
                  type="button"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M13 19l7-7-7-7v14zm-10 0l7-7-7-7v14z"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1" />
            </>
          ) : (
            <button
              aria-label="Play audio"
              className="flex-shrink-0 bg-slate-100 dark:bg-neutral-700 text-gray-600 dark:text-white hover:dark:text-white border-0 rounded-full p-2 focus:outline-none transition duration-300 ease-in-out"
              onClick={audioOnPlay}
              type="button"
            >
              {audioContent}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PaperNavbar;
