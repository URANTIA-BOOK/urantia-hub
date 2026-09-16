// Error Page
import Link from "next/link";
import HeadTag from "@/components/HeadTag";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 text-gray-600 dark:text-white relative">
      <HeadTag titlePrefix="Error" />

      <header className="fixed top-0 left-0 right-0 md:top-4 md:left-6 md:right-unset hidden md:block z-10 mx-auto p-2">
        <Link className="text-2xl text-left hover:no-underline" href="/">
          <span className="flex items-center font-bold tracking-wide text-2xl text-gray-600">
            <span className="flex items-center font-light">Urantia</span>
            Hub
          </span>
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen md:min-h-0 w-full md:w-auto p-6 rounded bg-white shadow-lg">
        <h1 className="font-bold text-2xl text-gray-600 mb-2 text-center">
          Authentication Error
        </h1>
        <p className="text-gray-400 mb-4 text-center">
          An error occurred during the sign-in process. Please try signing in
          again.
        </p>
        <Link
          className="py-2 px-3 border-0 text-center rounded bg-blue-400 hover:bg-blue-500 hover:no-underline transition-colors duration-300 ease-in-out"
          href="/auth/sign-in"
        >
          Return to Sign In
        </Link>
      </main>
    </div>
  );
};

export { authOffReadRedirect as getServerSideProps } from "@/libs/authOffRedirect";

export default ErrorPage;
