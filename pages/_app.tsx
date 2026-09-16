// Node modules.
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider, useSession } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Lato } from "next/font/google";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import type { AppProps } from "next/app";
import type { NextComponentType, NextPageContext } from "next";
// Relative modules.
import { ThemeProvider } from "@/context/theme";
import { ReadingFlowProvider } from "@/context/readingFlow";
import { ReadingLanguageProvider } from "@/context/readingLanguage";
import "@/styles/globals.css";
import SentryErrorBoundary from "@/components/SentryErrorBoundary";
import { Toaster } from "sonner";

const googleFont = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

interface AppContentProps {
  Component: NextComponentType<NextPageContext, unknown, Record<string, unknown>>;
  pageProps: Record<string, unknown>;
}

// Wrap the actual app content with session tracking
function AppContent({ Component, pageProps }: AppContentProps) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      if (status === "authenticated" && session?.user) {
        Sentry.setUser(session.user as Sentry.User);
      } else {
        Sentry.setUser(null);
      }
    }
  }, [session, status]);

  return (
    <SentryErrorBoundary>
      <Toaster className="toaster" richColors />
      <Component {...pageProps} />
    </SentryErrorBoundary>
  );
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <div className={googleFont.className}>
      <ThemeProvider>
        <SessionProvider session={session}>
          <ReadingLanguageProvider>
            <ReadingFlowProvider>
              <AppContent Component={Component} pageProps={pageProps} />
            </ReadingFlowProvider>
          </ReadingLanguageProvider>
        </SessionProvider>
      </ThemeProvider>
      {process.env.NODE_ENV !== "development" && <SpeedInsights />}
      {process.env.NODE_ENV !== "development" && <Analytics />}
    </div>
  );
}
