// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import { isAuthEnabled } from "@/libs/authEnabled";
import { resolveReadRedirect } from "@/libs/readingFlow";
import getSessionDetails from "@/utils/getSessionDetails";

const TEMPORARY_REDIRECT = 307;

const firstQuery = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const handleGet = (
  req: NextApiRequest,
  res: NextApiResponse,
  user?: User
) => {
  const href = resolveReadRedirect({
    paperId: firstQuery(req.query.paperId),
    globalId: firstQuery(req.query.globalId),
    language: firstQuery(req.query.lang),
    source: firstQuery(req.query.source),
    lastVisitedPaperId: user?.lastVisitedPaperId,
    lastVisitedGlobalId: user?.lastVisitedGlobalId,
  });
  res.redirect(TEMPORARY_REDIRECT, href);
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let user: User | undefined;
  if (isAuthEnabled()) {
    try {
      const sessionDetails = await getSessionDetails(req, res, {
        skipUnauthorized: true,
      });
      user = sessionDetails?.user;
    } catch {
      user = undefined;
    }
  }

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGet(req, res, user);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
