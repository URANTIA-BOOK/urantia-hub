// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import { OPEN_SOURCE_PAPERS_URL } from "@/utils/config";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="About UrantiaHub - An independent, open community platform for reading and studying The Urantia Book."
        titlePrefix="About"
      />
      <Navbar />
      <main className="mt-8 flex-grow container mx-auto px-4 my-4 mb-8 max-w-3xl">
        <section className="space-y-8">
          <h1 className="text-3xl font-bold text-center">About UrantiaHub</h1>

          <div className="text-left space-y-6">
            <p className="text-lg">
              UrantiaHub is a free reading, study, and community platform for
              The Urantia Book. We provide full-text search, bookmarks, notes,
              AI-powered explanations, audio narration, and tools built to help
              readers engage deeply with the text.
            </p>

            <div className="p-4 border border-gray-600 rounded-lg">
              <h3 className="font-semibold mb-2">Independent Community Project</h3>
              <p>
                This is an independent community project. It is not affiliated
                with, endorsed by, or officially connected with Urantia
                Foundation. The Urantia Book text is in the public domain.
              </p>
            </div>

            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p>
              We believe the text, audio, translations, and developer tools for
              The Urantia Book should be so freely available that no single
              entity can control access to them. UrantiaHub exists to serve
              readers and to make it easy for others to build on this work
              without fear.
            </p>

            <h2 className="text-2xl font-bold">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <span className="font-semibold">Full-text reading</span> — All
                197 papers with paragraph-level tracking and bookmarking
              </li>
              <li>
                <span className="font-semibold">Audio narration</span> —
                Independently produced audio for every paper
              </li>
              <li>
                <span className="font-semibold">AI-powered study tools</span>{" "}
                — Ask questions about any passage and get contextual explanations
              </li>
              <li>
                <span className="font-semibold">Search</span> — Full-text
                search across all papers
              </li>
              <li>
                <span className="font-semibold">Notes &amp; bookmarks</span> —
                Personal study tools that stay with your account
              </li>
              <li>
                <span className="font-semibold">Open-source data</span> — Paper
                text and audio available as open-source datasets
              </li>
              <li>
                <span className="font-semibold">Developer API</span> — A public
                API at{" "}
                <a
                  href="https://urantia.dev"
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  urantia.dev
                </a>{" "}
                for anyone building Urantia Book applications
              </li>
            </ul>

            <h2 className="text-2xl font-bold">Open by Design</h2>
            <p>
              The original English text of The Urantia Book entered the public
              domain in 2006. Our audio narrations and translations are
              independently produced derivative works. We use the word
              &quot;Urantia&quot; descriptively, for nominative purposes, to
              identify the subject matter of our platform.
            </p>
            <p>
              We publish our paper data and audio as{" "}
              <a
                href={OPEN_SOURCE_PAPERS_URL}
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                open-source datasets
              </a>
              , and our{" "}
              <a
                href="https://urantia.dev"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                API
              </a>{" "}
              is available for developers who want to build their own tools and
              applications.
            </p>

            <h2 className="text-2xl font-bold">Contact</h2>
            <p>
              UrantiaHub is built and maintained by Kelson. Questions?{" "}
              <a
                href="mailto:kelson@urantiahub.com"
                className="text-blue-400 hover:underline"
              >
                kelson@urantiahub.com
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
