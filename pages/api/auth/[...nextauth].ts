// Node modules.
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  AUTH_OFF_READ_HREF,
  authOffNextAuthKind,
  isAuthEnabled,
  nextAuthAction,
} from "@/libs/authEnabled";
// Relative modules.
import { getResendClient } from "@/libs/resend";
import { getPrismaClient } from "@/libs/prisma/client";
import {
  getMagicLinkEmailHTML,
  getMagicLinkEmailText,
} from "@/utils/email-templates/magicLink";
import createLogger from "@/utils/logger";

const logger = createLogger("auth");

const prisma = getPrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          logger.info("Sending magic link email", { email });
          await getResendClient().emails.send({
            from: process.env.EMAIL_FROM as string,
            to: email,
            subject: "Sign in to UrantiaHub",
            html: getMagicLinkEmailHTML(url),
            text: getMagicLinkEmailText(url),
          });
          logger.info("Magic link sent successfully");
        } catch (error: unknown) {
          logger.error("Error sending magic link email", error);
          throw new Error("Error sending magic link email");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    error: "/auth/error",
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
    verifyRequest: "/auth/verify-request",
  },
};

const nextAuthHandler = NextAuth(authOptions);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isAuthEnabled()) {
    const kind = authOffNextAuthKind(nextAuthAction(req.query.nextauth));
    if (kind === "session") {
      res.status(200).json({});
      return;
    }
    if (kind === "csrf") {
      res.status(200).json({ csrfToken: "" });
      return;
    }
    if (kind === "providers") {
      res.status(200).json({});
      return;
    }
    res.redirect(307, AUTH_OFF_READ_HREF);
    return;
  }
  return nextAuthHandler(req, res);
}
