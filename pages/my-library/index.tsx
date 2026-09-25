// Node modules.
import Link from "next/link";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Note, Bookmark, User } from "@prisma/client";
import { useSession } from "next-auth/react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { renderLeadingText } from "@/utils/renderNode";
import { useReadingLanguage } from "@/context/readingLanguage";
import { paperHref } from "@/libs/readingFlow";

type Activity = UBNode &
  Bookmark &
  Note & { createdAt: string; noteText?: string };

const MyLibrary = () => {
  const { language, source } = useReadingLanguage();
  // Session.
  const { status } = useSession();

  // State.
  const [nodes, setNodes] = useState<Activity[]>([]);
  const [fetchingNodes, setFetchingNodes] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "note" | "bookmark">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"updatedAt" | "globalId">("updatedAt");
  const [paperFilter, setPaperFilter] = useState<number | "all">("all");

  // Fetch user data on component mount
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
      return;
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchActivityData();
    }
  }, [filterType, sortBy, paperFilter, status]);

  const fetchActivityData = async () => {
    try {
      const queryParamsObj: any = {
        filterType,
        sortBy,
      };
      if (paperFilter !== "all") {
        queryParamsObj.paperId = paperFilter;
      }
      const queryParams = new URLSearchParams(queryParamsObj).toString();

      const response = await fetch(`/api/user/activity?${queryParams}`);
      const data = await response.json();

      setNodes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingNodes(false);
    }
  };

  const renderNode = (node: Activity, index: number) => {
    switch (node.type) {
      case "note": {
        return (
          <Link
            aria-label="View note"
            className="mb-6 text-left hover:no-underline note bg-white dark:bg-zinc-900 p-4 rounded hover:shadow-lg transition duration-300 ease-in-out"
            href={paperHref(`${node.paperId}`, node.globalId, language, source)}
            id={node.createdAt}
            key={index}
          >
            <div className="leading-relaxed border-l-4 border-gray-200 dark:border-gray-500 pl-3 mb-1 pb-1 hover:dark:border-white transition duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-1 text-gray-400 dark:text-gray-500 text-xs">
                <span>{renderLeadingText(node as UBNodeLeadingTextProps)}</span>
                <div className="labels flex flex-row items-center mb-2">
                  <svg
                    className="w-6 h-6 mr-1.5 text-orange-500 dark:text-orange-400"
                    viewBox="0 0 24 24"
                  >
                    <path
                      className="fill-current"
                      d="M3 10h11v2H3zm0-2h11V6H3zm0 8h7v-2H3zm15.01-3.13.71-.71c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71zm-.71.71-5.3 5.3V21h2.12l5.3-5.3z"
                    />
                  </svg>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {moment(node.createdAt).fromNow()}
                  </span>
                </div>
              </div>
              <div
                className="max-h-96 overflow-y-auto text-gray-400 dark:text-gray-500 text-xs"
                dangerouslySetInnerHTML={{
                  __html: node.htmlText as string,
                }}
              />
              <div className="note-text text-gray-600 dark:text-white pt-2 text-base">
                {node.noteText}
              </div>
            </div>
          </Link>
        );
      }
      case "bookmark": {
        return (
          <Link
            aria-label="View bookmark"
            className="mb-6 text-left hover:no-underline bookmark bg-white dark:bg-zinc-900 p-4 rounded hover:shadow-lg transition duration-300 ease-in-out"
            href={paperHref(`${node.paperId}`, node.globalId, language, source)}
            id={node.createdAt}
            key={index}
          >
            <div className="leading-relaxed border-l-4 border-gray-200 dark:border-gray-500 pl-3 mb-1 pb-1 hover:dark:border-white transition duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-1 text-gray-400 dark:text-gray-500 text-xs">
                <span>{renderLeadingText(node as UBNodeLeadingTextProps)}</span>
                <div className="labels flex flex-row items-center mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <path
                      className="fill-emerald-400"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {moment(node.createdAt).fromNow()}
                  </span>
                </div>
              </div>
              <div
                className="max-h-96 overflow-y-auto text-gray-600 dark:text-white text-base"
                dangerouslySetInnerHTML={{
                  __html: node.htmlText as string,
                }}
              />
            </div>
          </Link>
        );
      }
      default: {
        console.error(`Unknown node type: ${node.type}`);
        return null;
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="Access your personal library on UrantiaHub, where you can view your bookmarks and comments from The Urantia Papers."
        titlePrefix="My Library"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content min-h-screen">
        {/* Navigation links for previous and next papers */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <h1 className="text-3xl font-bold mb-8">My Library</h1>

          <div className="flex flex-col md:flex-row justify-between w-full mb-6">
            <div className="flex flex-col md:items-center md:flex-row">
              {/* Filters icon */}
              <svg
                className="w-6 h-6 text-gray-400 md:mr-1 mb-2 md:mb-0 hidden md:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              <button
                aria-label="Filter by all"
                className={`${
                  filterType === "all"
                    ? "bg-blue-400 dark:bg-blue-500"
                    : "text-gray-400 dark:text-white bg-white dark:bg-zinc-700 hover:bg-white hover:dark:bg-zinc-700"
                } mb-2 md:mb-0 mr-0 md:mr-2 py-1 px-3 border-0 dark:py-1 dark:px-3 dark:border-0 text-center rounded hover:no-underline transition-colors duration-300 ease-in-out`}
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button
                aria-label="Filter by notes"
                className={`${
                  filterType === "note"
                    ? "bg-blue-400 dark:bg-blue-500"
                    : "text-gray-400 dark:text-white bg-white dark:bg-zinc-700 hover:bg-white hover:dark:bg-zinc-700"
                } mb-2 md:mb-0 mr-0 md:mr-2 py-1 px-3 border-0 dark:py-1 dark:px-3 dark:border-0 text-center rounded hover:no-underline transition-colors duration-300 ease-in-out`}
                onClick={() => setFilterType("note")}
              >
                Notes
              </button>
              <button
                aria-label="Filter by bookmarks"
                className={`${
                  filterType === "bookmark"
                    ? "bg-blue-400 dark:bg-blue-500"
                    : "text-gray-400 dark:text-white bg-white dark:bg-zinc-700 hover:bg-white hover:dark:bg-zinc-700"
                } mb-2 md:mb-0 mr-0 md:mr-2 py-1 px-3 border-0 dark:py-1 dark:px-3 dark:border-0 text-center rounded hover:no-underline transition-colors duration-300 ease-in-out`}
                onClick={() => setFilterType("bookmark")}
              >
                Bookmarks
              </button>
              <select
                className={`${
                  paperFilter !== "all"
                    ? "bg-blue-400 dark:bg-blue-500 select-selected"
                    : "text-gray-400 dark:text-white bg-white dark:bg-zinc-700 hover:bg-white hover:dark:bg-zinc-700"
                } mb-2 md:mb-0 mr-0 md:mr-2 py-1 px-3 pr-7 border-0 dark:py-1 dark:px-3 dark:pr-7 dark:border-0 text-center rounded hover:no-underline transition-colors duration-300 ease-in-out`}
                onChange={(event) =>
                  setPaperFilter(
                    event.target.value === "all"
                      ? "all"
                      : parseInt(event.target.value)
                  )
                }
              >
                <option value="all">All Papers</option>
                {Array.from({ length: 197 }, (_, index) => (
                  <option key={index} value={index}>
                    {index === 0 ? "Foreword" : `Paper ${index}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row md:flex-end">
              <select
                className="text-gray-400 dark:text-white bg-white dark:bg-zinc-700 hover:bg-white hover:dark:bg-zinc-700 mb-2 md:mb-0 py-1 px-3 pr-7 border-0 dark:py-1 dark:px-3 dark:pr-7 dark:border-0 text-center rounded hover:no-underline transition-colors duration-300 ease-in-out"
                onChange={(event) =>
                  setSortBy(event.target.value as "updatedAt" | "globalId")
                }
              >
                <option value="updatedAt">Most Recent</option>
                <option value="globalId">Sequentially</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {fetchingNodes && <Spinner />}

          {/* Activity nodes */}
          {nodes.length && !fetchingNodes ? (
            <div className="flex flex-col">
              {nodes?.map((node, index) => renderNode(node, index))}
            </div>
          ) : null}

          {/* No activity nodes */}
          {!nodes.length && !fetchingNodes ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400">
                No {filterType === "all" ? "bookmarks or note" : filterType}s
                found
                {filterType !== "all" || paperFilter !== "all"
                  ? ", try changing your filters"
                  : null}
                .
              </p>
              {filterType === "all" && paperFilter === "all" ? (
                <p className="text-gray-400">
                  Start by adding a{" "}
                  <Link className="text-blue-400" href="/papers/foreword">
                    note or bookmark to the Foreword
                  </Link>
                  .
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyLibrary;
