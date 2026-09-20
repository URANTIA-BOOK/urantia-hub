// Node modules.
import * as Sentry from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import { getResendClient } from "@/libs/resend";
import UserService from "@/services/user";
import { paperIdToUrl } from "@/utils/paperFormatters";
import {
  getContinueReadingEmailHTML,
  getContinueReadingEmailText,
} from "@/utils/email-templates/continueReading24Hours";
import createLogger from "@/utils/logger";
import { withSentry } from "@/middleware/sentry";

const logger = createLogger("sendContinueReading");

const userService = new UserService();

const handleCron = async (_: NextApiRequest, res: NextApiResponse) => {
  const users = await userService.findMany({
    where: {
      emailNotificationsEnabled: true,
      emailContinueReadingEnabled: true,
      lastVisitedGlobalId: {
        not: null,
      },
      lastVisitedPaperId: {
        not: null,
      },
      lastVisitedAt: {
        // Last visited between 0 and 48 hours ago.
        gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        lt: new Date(Date.now()),
      },
    },
  });

  // Prepare emails
  const { fetchParagraph } = await import("@/libs/urantiaApi/client");
  const messages = await Promise.all(
    users.map(async (user) => {
      // Fetch the paragraph details
      let paragraph: UBNode | null = null;
      try {
        paragraph = await fetchParagraph(user.lastVisitedGlobalId as string);
      } catch {
        paragraph = null;
      }

      if (!paragraph) {
        logger.error("Failed to fetch paragraph", undefined, { globalId: user.lastVisitedGlobalId as string, userId: user.id });
        return null;
      }

      const message = {
        from: process.env.EMAIL_FROM || "",
        to: user.email as string,
        subject: `Continue reading: ${user.lastVisitedPaperTitle}`,
        headers: {
          "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_HOST}/api/user/unsubscribe>`,
          Precedence: "Bulk",
          "X-Auto-Response-Suppress": "OOF",
        },
        clickTracking: false,
        html: getContinueReadingEmailHTML({
          paperTitle: user.lastVisitedPaperTitle as string,
          paperId: user.lastVisitedPaperId as string,
          text: paragraph.text ?? "",
          standardReferenceId: paragraph.standardReferenceId ?? "",
          continueReadingUrl: `${
            process.env.NEXT_PUBLIC_HOST
          }/papers/${paperIdToUrl(`${user.lastVisitedPaperId}`)}#${
            user.lastVisitedGlobalId
          }`,
        }),
        text: getContinueReadingEmailText({
          paperTitle: user.lastVisitedPaperTitle as string,
          paperId: user.lastVisitedPaperId as string,
          text: paragraph.text ?? "",
          standardReferenceId: paragraph.standardReferenceId ?? "",
          continueReadingUrl: `${
            process.env.NEXT_PUBLIC_HOST
          }/papers/${paperIdToUrl(`${user.lastVisitedPaperId}`)}#${
            user.lastVisitedGlobalId
          }`,
        }),
      };

      return message;
    })
  );

  // Filter out any null messages from failed paragraph fetches
  const validMessages = messages.filter(
    (message): message is NonNullable<typeof message> => message !== null
  );

  try {
    // Send the emails
    await getResendClient().batch.send(validMessages);

    // Update the lastAskedNotificationsAt field for each user
    await userService.updateMany({
      data: {
        lastAskedNotificationsAt: new Date(),
      },
      where: {
        id: {
          in: users.map((user) => user.id),
        },
      },
    });

    res
      .status(200)
      .json({ users: users.map((user) => user.email), success: true });
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

  logger.info("Sending continue reading emails");

  await handleCron(req, res);
};

export default withSentry(handler);
