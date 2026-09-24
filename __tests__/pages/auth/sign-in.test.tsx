import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signIn = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...rest }, children),
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ query: {}, push: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signIn(...args),
  useSession: () => ({ status: "unauthenticated" }),
}));

vi.mock("@/components/HeadTag", () => ({
  default: () => null,
}));

import SignInPage, { getServerSideProps } from "@/pages/auth/sign-in";

const AUTH_KEYS = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

describe("Sign-in page", () => {
  beforeEach(() => {
    signIn.mockReset();
    for (const key of AUTH_KEYS) delete process.env[key];
  });

  it("offers only Google when email is not configured", () => {
    render(<SignInPage email={false} google />);

    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send magic link" })).not.toBeInTheDocument();
    expect(screen.queryByText("or")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sign in with Google" }));
    expect(signIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/api/redirect/user/read",
    });
  });

  it("offers only the magic link when Google is not configured", () => {
    render(<SignInPage email google={false} />);

    expect(screen.getByRole("button", { name: "Send magic link" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign in with Google" })).not.toBeInTheDocument();
    expect(screen.queryByText("or")).not.toBeInTheDocument();
  });

  it("offers both methods when both pairs are configured", () => {
    render(<SignInPage email google />);

    expect(screen.getByRole("button", { name: "Send magic link" })).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
  });

  it("passes the configured pairs as page props", async () => {
    process.env.GOOGLE_CLIENT_ID = "id";
    process.env.GOOGLE_CLIENT_SECRET = "secret";

    await expect(getServerSideProps({} as never)).resolves.toEqual({
      props: { email: false, google: true },
    });
  });

  it("redirects to reading when no pair is configured", async () => {
    await expect(getServerSideProps({} as never)).resolves.toEqual({
      redirect: {
        destination: "/api/redirect/user/read",
        permanent: false,
      },
    });
  });
});
