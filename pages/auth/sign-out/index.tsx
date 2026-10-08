// Sign Out Page
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import HeadTag from "@/components/HeadTag";
import Link from "next/link";

const SignOutPage = () => {
  useEffect(() => {
    // Perform the sign out
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 text-gray-600 dark:text-white relative">
      <HeadTag titlePrefix="Sign Out" />

      <header className="fixed top-0 left-0 right-0 md:top-4 md:left-6 md:right-unset hidden md:block z-10 mx-auto p-2">
        <Link className="text-2xl text-left hover:no-underline" href="/">
          <span className="flex items-center font-bold tracking-wide text-2xl text-gray-600">
            <span className="flex items-center font-light">Urantia</span>
            Hub
          </span>
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen md:min-h-0 w-full md:w-auto p-6 rounded bg-white shadow-lg">
        <h1 className="font-bold text-2xl text-gray-600 mb-4 text-center">
          Signing Out...
        </h1>
        <p className="text-gray-400 text-center">
          You are being signed out. This should only take a moment.
        </p>
      </main>
    </div>
  );
};

export { authOffReadRedirect as getServerSideProps } from "@/libs/authOffRedirect";

export default SignOutPage;
