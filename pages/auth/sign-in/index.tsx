// Node modules.
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
// Relative modules.
import HeadTag from "@/components/HeadTag";
import Spinner from "@/components/Spinner";

const DEFAULT_CALLBACK_URL = "/api/redirect/user/read";

const SignInPage = () => {
  // Get the router.
  const router = useRouter();

  // Get the session.
  const { status } = useSession();

  // Add a state to hold the email address
  const [email, setEmail] = useState("");

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle email sign-in
  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      await signIn("email", { email, callbackUrl: DEFAULT_CALLBACK_URL });
    } catch (error) {
      console.error("Error signing in with email", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already authenticated, redirect to the /papers page.
  useEffect(() => {
    if (status === "authenticated") {
      router.push(
        (router?.query?.callbackUrl as string) || DEFAULT_CALLBACK_URL
      );
    }
  }, [router, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 text-gray-600 dark:text-white relative">
      <HeadTag
        metaDescription="Sign in to your UrantiaHub account to access your profile, create bookmarks, create notes, track your progress, and more."
        titlePrefix="Sign In"
      />

      <header className="fixed top-0 left-0 right-0 md:top-4 md:left-6 md:right-unset hidden md:block z-10 mx-auto p-2">
        <Link className="text-2xl text-left hover:no-underline" href="/">
          <span className="flex items-center font-bold tracking-wide text-2xl text-gray-600">
            <span className="flex items-center font-light">Urantia</span>
            Hub
          </span>
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen md:min-h-0 w-full md:w-auto p-6 rounded bg-white shadow-lg">
        <h1 className="font-bold tracking-wide text-3xl m-0 mb-6 text-center">
          <span className="font-light">Urantia</span>
          Hub
        </h1>

        {/* Uncomment the Email form */}
        <form
          className="flex flex-col w-full"
          onSubmit={handleEmailSignIn}
          noValidate
        >
          <label
            className="flex flex-col w-full"
            htmlFor="email"
            id="email-label"
          >
            <span className="text-gray-400 text-sm mb-1">Email</span>
            <input
              autoFocus
              className="text-sm focus:outline-0 border-0 bg-slate-200 text-gray-600 rounded py-2.5 px-3 mb-2"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              required
              type="email"
            />
          </label>
          <button
            className="py-2 px-3 border-0 text-center rounded bg-blue-400 hover:bg-blue-500 hover:no-underline transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="button-spinner" />
              </>
            ) : (
              "Send magic link"
            )}
          </button>
        </form>

        <div className="flex items-center justify-center w-full my-6">
          <hr className="w-full border-gray-200" />
          <span className="text-gray-400 text-xs mx-4">or</span>
          <hr className="w-full border-gray-200" />
        </div>

        {/* Google oAuth */}
        <button
          className="flex items-center justify-center border-1 border-gray-200 bg-white text-gray-600 rounded px-6 py-2 hover:bg-slate-200 transition-all duration-300 w-full"
          onClick={() => {
            signIn("google", {
              callbackUrl:
                (router?.query?.callbackUrl as string) || DEFAULT_CALLBACK_URL,
            });
          }}
        >
          <svg
            className="w-6 h-6 mr-2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Sign in with Google
        </button>
        <p className="text-gray-400 text-xs mt-6">
          By signing in, you agree to the{" "}
          <Link
            className="text-blue-400 hover:text-blue-500 transition-all duration-200 ease-in-out"
            href="/terms-of-service"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            className="text-blue-400 hover:text-blue-500 transition-all duration-200 ease-in-out"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
};

export { authOffReadRedirect as getServerSideProps } from "@/libs/authOffRedirect";

export default SignInPage;
