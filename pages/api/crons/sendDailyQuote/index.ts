// Node modules.
import * as Sentry from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import { getResendClient } from "@/libs/resend";
import SentQuoteService from "@/services/sentQuote";
import UserService from "@/services/user";
import CuratedQuoteService from "@/services/curatedQuote";
import { paperIdToUrl } from "@/utils/paperFormatters";
import {
  getDailyQuoteEmailHTML,
  getDailyQuoteEmailText,
} from "@/utils/email-templates/dailyQuote";
import createLogger from "@/utils/logger";
import { withSentry } from "@/middleware/sentry";

const logger = createLogger("sendDailyQuote");

const curatedQuoteService = new CuratedQuoteService();
const sentQuoteService = new SentQuoteService();
const userService = new UserService();

const handleCron = async (_: NextApiRequest, res: NextApiResponse) => {
  // Get users who have both general and daily quote notifications enabled
  logger.info("Fetching users");
  const users = await userService.findMany({
    where: {
      emailNotificationsEnabled: true,
      emailDailyQuoteEnabled: true,
    },
  });

  // Get a curated quote
  logger.info("Fetching curated quote");
  const curatedQuotes = await curatedQuoteService.getRandom({
    sent: false,
  });
  const curatedQuote = curatedQuotes?.[0];

  if (!curatedQuote?.globalId) {
    logger.info("Failed to get a curated quote, are there any unsent curated quotes left?");
    return res.status(500).json({
      error: "Failed to get a curated quote",
      success: false,
    });
  }

  // Get a random quote
  logger.info("Fetching paragraph");
  const { fetchParagraph } = await import("@/libs/urantiaApi/client");
  let paragraph: UBNode | null = null;
  try {
    paragraph = await fetchParagraph(curatedQuote.globalId);
  } catch {
    paragraph = null;
  }

  if (!paragraph) {
    logger.info("Failed to get a curated quote from urantia.dev", { globalId: curatedQuote.globalId });
    return res.status(500).json({
      error: "Failed to get a curated quote from urantia.dev",
      success: false,
    });
  }

  const globalId = paragraph.globalId;
  const text = paragraph.text ?? "";
  const paperId = paragraph.paperId;
  const standardReferenceId = paragraph.standardReferenceId ?? "";

  // Fetch existing sent quotes for this globalId
  logger.info("Fetching existing sent quotes");
  const existingSentQuotes = await sentQuoteService.findMany({
    where: {
      globalId,
      userId: {
        in: users.map((user) => user.id),
      },
    },
  });

  // Extract user IDs from existing sent quotes
  logger.info("Extracting user IDs from existing sent quotes");
  const usersWithSentQuote = existingSentQuotes.map(
    (sentQuote) => sentQuote.userId
  );

  // Filter users who have not received this quote
  logger.info("Filtering users who have not received this quote");
  const usersToSend = users.filter(
    (user) => !usersWithSentQuote.includes(user.id)
  );

  // Prepare emails
  logger.info("Preparing emails");
  const messages = usersToSend.map((user) => ({
    from: process.env.EMAIL_FROM || "",
    to: user.email as string,
    subject: "Your Daily Quote",
    headers: {
      "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_HOST}/api/user/unsubscribe>`,
      Precedence: "Bulk",
      "X-Auto-Response-Suppress": "OOF",
    },
    clickTracking: false,
    html: getDailyQuoteEmailHTML({
      paperTitle: paragraph.paperTitle,
      paperId,
      text,
      standardReferenceId,
      continueReadingUrl: `${
        process.env.NEXT_PUBLIC_HOST
      }/papers/${paperIdToUrl(`${paperId}`)}#${globalId}`,
      lastVisitedUrl: `${process.env.NEXT_PUBLIC_HOST}/api/redirect/user/read`,
    }),
    text: getDailyQuoteEmailText({
      paperTitle: paragraph.paperTitle,
      paperId,
      text,
      standardReferenceId,
      continueReadingUrl: `${
        process.env.NEXT_PUBLIC_HOST
      }/papers/${paperIdToUrl(`${paperId}`)}#${globalId}`,
      lastVisitedUrl: `${process.env.NEXT_PUBLIC_HOST}/api/redirect/user/read`,
    }),
  }));

  try {
    // Send the emails
    await getResendClient().batch.send(messages);

    // Create sent quotes for each user.
    logger.info("Creating sent quotes");
    await Promise.all(
      usersToSend.map((user) =>
        sentQuoteService.create({
          data: {
            globalId,
            paperId,
            userId: user.id,
          },
        })
      )
    );

    // Update curated quote to mark it as sent
    logger.info("Updating curated quote to mark it as sent");
    await curatedQuoteService.update(curatedQuote.id, {
      sentAt: new Date(),
    });

    logger.info("Emails sent successfully");
    res
      .status(200)
      .json({ users: usersToSend.map((user) => user.email), success: true });
  } catch (error: unknown) {
    logger.error("Operation failed", error);
    Sentry.captureException(error);
    if (error instanceof Object && "response" in error) {
      logger.error("Response body", (error as Record<string, unknown>).response);
    }
    res.status(500).json({ error: "Failed to send emails", success: false });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Check if the secret key matches
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  logger.info("Sending daily quote emails");

  await handleCron(req, res);
};

export default withSentry(handler);
