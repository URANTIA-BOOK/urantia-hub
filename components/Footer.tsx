// Node modules.
import Link from "next/link";
import { useUiCopy } from "@/libs/uiCopy";
import { OPEN_SOURCE_PAPERS_URL } from "@/utils/config";
import { deriveReadLink } from "@/utils/readPaperLink";
import { useSession } from "next-auth/react";

const Footer = ({ marginBottom }: { marginBottom?: string }) => {
  // Hooks.
  const { status } = useSession();
  const copy = useUiCopy();

  return (
    <footer
      className="bg-slate-100 text-gray-400"
      style={{ marginBottom: marginBottom || "4.3rem" }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-gray-600 text-lg font-bold tracking-wide mb-4 flex items-center text-center md:text-left w-full">
              <span className="flex items-center font-light">Urantia</span>
              Hub
            </h3>
          </div>
          <div>
            <h4 className="text-gray-600 text-sm font-semibold mb-4">
              {copy.navigation}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/"
                >
                  {copy.home}
                </Link>
              </li>
              <li>
                {/* A plain anchor, not next/link: the href is an API route that
                    307s, and a client-side transition to it renders the target
                    page with empty props. */}
                <a
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href={deriveReadLink(status)}
                >
                  {copy.read}
                </a>
              </li>
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/papers"
                >
                  {copy.papers}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-600 text-sm font-semibold mb-4">
              {copy.resources}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/community-resources"
                >
                  {copy.communityResources}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href={OPEN_SOURCE_PAPERS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.openSourcePapers}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/blockchain-archive"
                >
                  {copy.blockchainArchive}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/changelog"
                >
                  {copy.latestUpdates}
                </Link>
              </li>
              <li>
                <a
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="mailto:team@urantiahub.com"
                >
                  {copy.contact}
                </a>
              </li>
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/about"
                >
                  {copy.about}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-600 text-sm font-semibold mb-4">{copy.legal}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/privacy-policy"
                >
                  {copy.privacy}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/terms-of-service"
                >
                  {copy.terms}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:no-underline"
                  href="/cookie-policy"
                >
                  {copy.cookies}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-sm border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>
            &copy; {new Date().getFullYear()} UrantiaHub. {copy.allRightsReserved}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              aria-label="Uptime Robot status page"
              className="flex items-center text-green-400 text-xs hover:text-green-500 ml-4"
              href="https://stats.uptimerobot.com/6qzJEHV7rN"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="flex relative h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>{" "}
              {copy.allSystemsNormal}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
