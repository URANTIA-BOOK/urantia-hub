// Node modules.
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LogoSymbol from "./LogoSymbol";
import ReadingLanguageNav from "./ReadingLanguageNav";
import { isAuthEnabled } from "@/libs/authEnabled";
import { useUiCopy } from "@/libs/uiCopy";
import { useReadingFlow } from "@/context/readingFlow";
import { MenuIcon } from "lucide-react";

const HomepageNavbar = () => {
  const { status } = useSession();
  const router = useRouter();
  const { readHref } = useReadingFlow();
  const copy = useUiCopy();
  const authEnabled = isAuthEnabled();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto bg-gradient-to-b from-black/55 via-black/25 to-transparent">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <Link
            className="flex min-w-0 items-center gap-2 text-white hover:no-underline"
            href="/"
          >
            <LogoSymbol className="h-6 w-6 shrink-0 text-white md:h-7 md:w-7" />
            <h1 className="m-0 truncate text-lg font-bold tracking-wide text-white md:text-xl">
              <span className="font-light">Urantia</span>Hub
            </h1>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <ReadingLanguageNav tone="hero" />
            <a
              className="rounded-full px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-white/10 hover:no-underline"
              href={readHref}
            >
              {copy.read}
            </a>
            {status === "authenticated" && (
              <Link
                aria-label={copy.more}
                className="text-white transition-colors duration-200 hover:text-white/80 hover:no-underline"
                href="/more"
              >
                <MenuIcon className="h-6 w-6" />
              </Link>
            )}
            {authEnabled && status === "unauthenticated" && (
              <button
                className="border-0 bg-transparent p-0 text-sm text-white transition-colors duration-200 hover:text-white/80 hover:no-underline"
                onClick={() => router.push("/auth/sign-in")}
                type="button"
              >
                {copy.signIn}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomepageNavbar;
