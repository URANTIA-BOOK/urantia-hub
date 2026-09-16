// Node modules.
import { useState } from "react";
// Relative modules.
import Modal from "@/components/Modal";
import Spinner from "./Spinner";
import { renderLeadingText } from "@/utils/renderNode";
import { useUiCopy } from "@/libs/uiCopy";

const CHAR_LIMIT = 1000;

type NoteProps = {
  onClose: () => void;
  node?: UBNode;
};

const Note = ({ onClose, node }: NoteProps) => {
  const copy = useUiCopy();
  // Network states.
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // State.
  const [text, setText] = useState<string>("");

  const onSubmit = async (event: any) => {
    event.preventDefault();

    // Escape early if we are already creating the note.
    if (creating) {
      return;
    }

    if (text.length > CHAR_LIMIT) {
      setError(
        `Notes currently only support up to ${CHAR_LIMIT} characters, but you entered ${text.length} characters.`
      );
      return;
    }

    if (text.trim().length === 0) {
      setError("Note cannot be empty.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      // Make request to save note for user.
      await fetch(`/api/user/nodes/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          globalId: node?.globalId,
          paperId: node?.paperId,
          paperSectionId: node?.paperSectionId,
          paperSectionParagraphId: node?.paperSectionParagraphId,
          text: text.trim(),
        }),
      });
      onClose();
    } catch (error: any) {
      console.log("Error attempting to save note:", error);
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col px-4 py-3">
        <h2 className="text-2xl mb-4">
          Create a <span className="dark:text-orange-600">Note</span>
        </h2>

        {/* Loading */}
        {!node && <Spinner />}

        {node && (
          <>
            {/* Leading text */}
            <div className="leading-relaxed border-l-4 border-gray-200 dark:border-gray-500 pl-3 mb-4 pb-1">
              <div className="flex items-center justify-between mb-2 text-gray-400 dark:text-gray-500 text-xs">
                <span>
                  {renderLeadingText(node as UBNodeLeadingTextProps, copy)}
                </span>
              </div>
              <div
                className="max-h-96 overflow-y-auto text-gray-600 dark:text-gray-500 text-base isolated-quote"
                dangerouslySetInnerHTML={{
                  __html: node.htmlText as string,
                }}
              />
            </div>

            {/* Note form */}
            <form className="flex flex-col px-2 mb-2" onSubmit={onSubmit}>
              <textarea
                autoFocus
                className="focus:outline-none border-0 bg-slate-200 text-gray-600 dark:bg-zinc-900 dark:text-white rounded py-2 px-3 mb-4"
                onChange={(event: any) => setText(event.target.value)}
                placeholder="Type your note here..."
                value={text}
              />
              {error && <p className="text-rose-500 mb-4">{error}</p>}
              <div className="flex justify-center items-center">
                <button
                  className="mb-2 md:mb-0 mr-0 md:mr-2 py-2 px-3 border-0 text-center rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className={`mb-2 md:mb-0 mr-0 md:mr-2 py-2 px-3 border-0 text-center rounded bg-blue-400 hover:bg-blue-500 dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out ${
                    creating || text.trim().length === 0
                      ? "bg-blue-200 hover:bg-blue-200 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={creating}
                  type="submit"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};

export default Note;
