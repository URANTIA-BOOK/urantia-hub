// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import { editionQuery } from "@/libs/urantiaApi/client";
import { isLanguageCode, isSourceId } from "@/libs/readingLanguage";
import getSessionDetails from "@/utils/getSessionDetails";
import { paperIdToUrl } from "@/utils/paperFormatters";
import { withSentry } from "@/middleware/sentry";

const TEMPORARY_REDIRECT = 307;

const redirectToPaper = (
  res: NextApiResponse,
  paperId?: string | null,
  globalId?: string | null,
  lang?: string | null,
  source?: string | null
) => {
  // Default to the explore page.
  if (!paperId && !globalId) {
    res.redirect(TEMPORARY_REDIRECT, "/explore");
    return;
  }

  // If only 1 of the 2 is provided, 400.
  if ((paperId && !globalId) || (!paperId && globalId)) {
    res
      .status(400)
      .end(`Invalid query parameters, must provide both paperId and globalId`);
    return;
  }

  // Redirect to the paper.
  const path = `/papers/${paperIdToUrl(`${paperId}`)}`;
  const query = editionQuery(
    isLanguageCode(lang) ? lang : null,
    isSourceId(source) ? source : null
  );
  res.redirect(TEMPORARY_REDIRECT, `${path}${query}#${globalId}`);
};

// Handle GET method.
const handleGet = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user?: User
) => {
  // If unauthorized, use req.query if provided (e.g. they stored last visited node in localStorage).
  const lang = Array.isArray(req.query.lang) ? req.query.lang[0] : req.query.lang;
  const source = Array.isArray(req.query.source)
    ? req.query.source[0]
    : req.query.source;
  const editionLang = isLanguageCode(lang) ? lang : user?.readingLanguage;
  const editionSource = isSourceId(source) ? source : null;

  if (!user?.lastVisitedGlobalId) {
    return redirectToPaper(
      res,
      req.query.paperId as string,
      req.query.globalId as string,
      editionLang,
      editionSource
    );
  }

  return redirectToPaper(
    res,
    user.lastVisitedPaperId,
    user.lastVisitedGlobalId,
    editionLang,
    editionSource
  );
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionDetails = await getSessionDetails(req, res, {
    skipUnauthorized: true,
  });

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGet(req, res, sessionDetails?.user);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withSentry(handler);
