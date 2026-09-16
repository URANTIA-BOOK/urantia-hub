// Node modules.
import { useState, useEffect } from "react";
// Relative modules.
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";
import { renderLeadingText } from "@/utils/renderNode";
import { useUiCopy } from "@/libs/uiCopy";
import { Bookmark } from "@prisma/client";
import { BookmarkIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

type BookmarkCategoryModalProps = {
  bookmark?: Bookmark | null;
  node?: UBNode | null;
  onCategorySelect: (bookmarkId: string, category: string) => Promise<void>;
  onClose?: () => void;
};

const BookmarkCategoryModal = ({
  onClose,
  node,
  bookmark,
  onCategorySelect,
}: BookmarkCategoryModalProps) => {
  const copy = useUiCopy();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingNew, setCreatingNew] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/user/bookmark-categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    if (!bookmark) {
      toast.error("Bookmark not found, please try again");
      return;
    }

    try {
      await onCategorySelect(bookmark.id, newCategoryName.trim());
      onClose?.();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col px-4 py-3">
        <h2 className="text-2xl mb-4 flex items-center">
          <BookmarkIcon className="w-7 h-7 fill-emerald-400 dark:fill-emerald-400 stroke-transparent mr-1 -ml-1" />
          Assign bookmark to category
        </h2>
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
                className="max-h-96 overflow-y-auto text-gray-600 dark:text-white text-base"
                dangerouslySetInnerHTML={{
                  __html: node.htmlText as string,
                }}
              />
            </div>

            {loading ? (
              <Spinner />
            ) : (
              <div className="flex flex-col gap-2">
                {categories.map((category) => (
                  <button
                    className="flex items-center gap-3 p-2 border-0 dark:border-0 text-left rounded bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                    key={category}
                    onClick={async () => {
                      if (bookmark) {
                        await onCategorySelect(bookmark.id, category);
                        onClose?.();
                      }
                    }}
                  >
                    {category}
                  </button>
                ))}

                {creatingNew ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      className="flex-1 px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400"
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      type="text"
                      value={newCategoryName}
                    />
                    <button
                      className="border-0 px-4 py-2 bg-emerald-400 text-white rounded hover:bg-emerald-500 transition-colors"
                      onClick={handleCreateCategory}
                    >
                      Create
                    </button>
                  </div>
                ) : (
                  <button
                    className="flex items-center p-2 border-0 dark:border-0 text-left rounded bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                    onClick={() => setCreatingNew(true)}
                    type="button"
                  >
                    <div className="bg-emerald-400 dark:bg-emerald-400 p-1 rounded mr-2">
                      <PlusIcon className="w-4 h-4 stroke-white dark:stroke-white" />
                    </div>
                    <span>Create new category</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                className="mb-2 md:mb-0 mr-0 py-2 px-3 border-0 dark:py-2 dark:px-3 dark:border-0 text-center rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default BookmarkCategoryModal;
