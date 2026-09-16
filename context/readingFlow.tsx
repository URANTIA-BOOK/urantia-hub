import { useSession } from "next-auth/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isAuthEnabled } from "@/libs/authEnabled";
import {
  deriveReadHref,
  readStoredLastVisited,
  writeStoredLastVisited,
} from "@/libs/readingFlow";
import { useReadingLanguage } from "@/context/readingLanguage";

type ReadingFlowContextValue = {
  lastVisited: LastVisitedNode | null;
  ready: boolean;
  hasHistory: boolean;
  readHref: string;
  setLastVisited: (node: LastVisitedNode) => void;
};

const ReadingFlowContext = createContext<ReadingFlowContextValue>({
  lastVisited: null,
  ready: false,
  hasHistory: false,
  readHref: "/api/redirect/user/read",
  setLastVisited: () => {},
});

export const ReadingFlowProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { status } = useSession();
  const { language } = useReadingLanguage();
  const [lastVisited, setLastVisitedState] = useState<LastVisitedNode | null>(
    null
  );
  const [ready, setReady] = useState(false);

  const hydrate = useCallback(() => {
    setLastVisitedState(readStoredLastVisited());
  }, []);

  useEffect(() => {
    hydrate();
    setReady(true);
    const onChange = () => hydrate();
    window.addEventListener("reading-flow", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("reading-flow", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthEnabled() || status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/user/nodes/last-visited")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.paperId) return;
        writeStoredLastVisited(data);
        setLastVisitedState(data);
      })
      .catch(() => {
        if (!cancelled) hydrate();
      });
    return () => {
      cancelled = true;
    };
  }, [hydrate, status]);

  const setLastVisited = useCallback((node: LastVisitedNode) => {
    writeStoredLastVisited(node);
    setLastVisitedState(node);
  }, []);

  const value = useMemo<ReadingFlowContextValue>(
    () => ({
      lastVisited,
      ready,
      hasHistory: Boolean(lastVisited?.paperId),
      readHref: deriveReadHref({ lastVisited, language }),
      setLastVisited,
    }),
    [language, lastVisited, ready, setLastVisited]
  );

  return (
    <ReadingFlowContext.Provider value={value}>
      {children}
    </ReadingFlowContext.Provider>
  );
};

export const useReadingFlow = () => useContext(ReadingFlowContext);
