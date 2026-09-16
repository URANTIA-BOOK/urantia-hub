// Node modules.
import { useState } from "react";
import Link from "next/link";
// Relative modules.
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";
import { renderLeadingText } from "@/utils/renderNode";
import { paperIdToUrl } from "@/utils/paperFormatters";
import { useUiCopy } from "@/libs/uiCopy";

const constructShareUrl = (node: UBNode) => {
  // Replace this with actual URL construction logic
  return `${process.env.NEXT_PUBLIC_HOST}/papers/${paperIdToUrl(
    node.paperId
  )}#${node.globalId}`;
};

type ShareProps = {
  onClose?: () => void;
  node?: UBNode;
};

const Share = ({ onClose, node }: ShareProps) => {
  const copy = useUiCopy();
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const shareUrl = node ? constructShareUrl(node) : "";
  const shareText = node
    ? `"${node.text?.trim()}"\n\nUrantia ${renderLeadingText(
        node as UBNodeLeadingTextProps,
        copy
      )}\n`
    : "";

  return (
    <Modal onClose={onClose}>
      <>
        <div className="flex flex-col px-4 py-3">
          <h2 className="text-2xl mb-4">Share this Quote</h2>
          {!node && <Spinner />}
          {node && (
            <>
              <div className="leading-relaxed border-l-4 border-gray-200 dark:border-gray-500 pl-3 pb-1 mb-4">
                <div className="flex items-center justify-between mb-2 text-gray-400 dark:text-gray-500 text-xs">
                  <span>
                    {renderLeadingText(node as UBNodeLeadingTextProps, copy)}
                  </span>
                </div>
                <div
                  className="max-h-96 overflow-y-auto text-gray-600 dark:text-white text-base isolated-quote"
                  dangerouslySetInnerHTML={{
                    __html: node.htmlText as string,
                  }}
                />
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-center mb-2">
                <button
                  className="mb-2 md:mb-0 mr-0 md:mr-2 py-2 px-3 border-0 dark:py-2 dark:px-3 dark:border-0 text-center rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="mb-2 md:mb-0 mr-0 md:mr-2 py-2 px-3 border-0 dark:py-2 dark:px-3 dark:border-0 text-center rounded bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 hover:dark:bg-blue-600 hover:no-underline transition-colors duration-300 ease-in-out"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                  }}
                  type="button"
                >
                  {copiedLink ? "Copied!" : "Copy Link"}
                </button>
                <Link
                  className="mb-2 md:mb-0 mr-0 md:mr-2 flex items-center text-center justify-center py-2 px-3 border-0 dark:py-2 dark:px-3 dark:border-0 text-center rounded bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 hover:dark:bg-blue-600 hover:no-underline transition-colors duration-300 ease-in-out"
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                    shareText
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on X
                </Link>
                <Link
                  className="mb-2 md:mb-0 mr-0 md:mr-2 flex items-center text-center justify-center py-2 px-3 border-0 dark:py-2 dark:px-3 dark:border-0 text-center rounded bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 hover:dark:bg-blue-600 hover:no-underline transition-colors duration-300 ease-in-out"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on Facebook
                </Link>
              </div>
            </>
          )}
        </div>
      </>
    </Modal>
  );
};

export default Share;
