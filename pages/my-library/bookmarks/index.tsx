// Node modules.
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import moment from "moment";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { useReadingLanguage } from "@/context/readingLanguage";
import { paperHref } from "@/libs/readingFlow";
import { renderLeadingText } from "@/utils/renderNode";
import { Bookmark } from "@prisma/client";
import { Bookmark as BookmarkIcon, ChevronDownIcon, Heart } from "lucide-react";

type BookmarkNode = Bookmark & UBNode;

const BookmarksPage = () => {
  const { language, source } = useReadingLanguage();
  // Session
  const { status } = useSession();

  // State
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
      return;
    }

    if (status === "authenticated") {
      fetchBookmarks();
    }
  }, [status]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(
        "/api/user/activity?filterType=bookmark&sortBy=updatedAt"
      );
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group bookmarks by category and sort them
  const bookmarksByCategory = Object.entries(
    bookmarks.reduce((acc, bookmark) => {
      const category = bookmark.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(bookmark);
      return acc;
    }, {} as Record<string, BookmarkNode[]>)
  ).sort((a, b) => {
    // Make "Uncategorized" always come first
    if (a[0] === "Uncategorized") return -1;
    if (b[0] === "Uncategorized") return 1;

    // Otherwise sort alphabetically
    return a[0].localeCompare(b[0]);
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="View and manage your bookmarks organized by category"
        titlePrefix="Bookmarks"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <BookmarkIcon className="w-7 h-7 mr-1 text-emerald-400 fill-emerald-400" />
            Bookmarks
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarksByCategory.map(([category, bookmarks]) => (
              <div
                key={category}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
              >
                <div
                  className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  <h2 className="text-xl font-semibold flex items-center justify-between">
                    <div className="flex items-center">
                      <ChevronDownIcon
                        className={`w-5 h-5 mr-2 transition-transform ${
                          expandedCategories.has(category) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      />
                      {category}
                    </div>
                    <span className="text-gray-400 font-normal text-base dark:text-gray-400">
                      ({bookmarks.length})
                    </span>
                  </h2>
                </div>

                <div
                  className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                    expandedCategories.has(category) ? "" : "hidden"
                  }`}
                >
                  {bookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.id}
                      href={paperHref(
                        `${bookmark.paperId}`,
                        bookmark.globalId,
                        language,
                        source
                      )}
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition duration-150 fade-in"
                    >
                      <div className="flex items-center justify-between mb-1 text-gray-400 dark:text-gray-500 text-xs">
                        <span>
                          {renderLeadingText(
                            bookmark as UBNodeLeadingTextProps
                          )}
                        </span>
                        <div className="labels flex flex-row items-center">
                          <Heart className="w-4 h-4 mr-2 text-emerald-400 fill-emerald-400" />
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {moment(bookmark.createdAt).fromNow()}
                          </span>
                        </div>
                      </div>
                      <div
                        className="text-gray-600 dark:text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: bookmark.htmlText as string,
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {bookmarks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  You haven&apos;t added any bookmarks yet. Start by adding some
                  bookmarks while reading.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BookmarksPage;
