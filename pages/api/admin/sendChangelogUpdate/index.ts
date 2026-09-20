// Node modules.
import * as Sentry from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import { getResendClient } from "@/libs/resend";
import UserService from "@/services/user";
import {
  getChangelogUpdateEmailHTML,
  getChangelogUpdateEmailText,
} from "@/utils/email-templates/changelogUpdate";
import getSessionDetails from "@/utils/getSessionDetails";
import { withSentry } from "@/middleware/sentry";
import createLogger from "@/utils/logger";

const logger = createLogger("sendChangelogUpdate");

const userService = new UserService();
const handleSendChangelogUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const sessionDetails = await getSessionDetails(req, res, { isAdmin: true });
  if (!sessionDetails) return;

  logger.info("Sending changelog update emails");

  // Get the changelog data from the request body
  const { excludedUserEmails, version, changes, images } = req.body;

  if (!version || !changes || !Array.isArray(changes)) {
    return res.status(400).json({
      error:
        "Invalid request body. Required: version (string) and changes (string[])",
      success: false,
    });
  }

  // Get all users with both general and changelog notifications enabled
  const users = await userService.findMany({
    where: {
      email: {
        notIn: excludedUserEmails || [],
      },
      emailNotificationsEnabled: true,
      emailChangelogEnabled: true,
    },
  });

  const userEmails = users?.map((user) => user.email) || [];

  logger.info(`Sending changelog update emails to ${userEmails.length} users`, { userEmails: userEmails as unknown as Record<string, unknown> });

  const changelogUrl = `${process.env.NEXT_PUBLIC_HOST}/changelog`;

  // Prepare emails
  const messages = users.map((user) => ({
    from: process.env.EMAIL_FROM || "",
    to: user.email as string,
    subject: `New Updates to UrantiaHub (v${version})`,
    headers: {
      "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_HOST}/api/user/unsubscribe>`,
      Precedence: "Bulk",
      "X-Auto-Response-Suppress": "OOF",
    },
    clickTracking: false,
    html: getChangelogUpdateEmailHTML({
      version,
      changes,
      changelogUrl,
      images,
    }),
    text: getChangelogUpdateEmailText({
      version,
      changes,
      changelogUrl,
    }),
  }));

  try {
    // Send the emails
    await getResendClient().batch.send(messages);

    res.status(200).json({
      userEmails,
      success: true,
    });
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
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await handleSendChangelogUpdate(req, res);
};

export default withSentry(handler);
