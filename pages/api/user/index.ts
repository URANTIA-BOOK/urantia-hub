// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, User } from "@prisma/client";
// Relative modules.
import AccountService from "@/services/account";
import BookmarkService from "@/services/bookmark";
import NoteService from "@/services/note";
import SessionService from "@/services/session";
import ShareService from "@/services/share";
import UserService from "@/services/user";
import getSessionDetails from "@/utils/getSessionDetails";
import { withSentry } from "@/middleware/sentry";
import createLogger from "@/utils/logger";
import { isReaderLang } from "@/libs/readingLanguage";

const logger = createLogger("api/user");

// Services.
const accountService = new AccountService();
const bookmarkService = new BookmarkService();
const noteService = new NoteService();
const sessionService = new SessionService();
const shareService = new ShareService();
const userService = new UserService();

// GET handler
const handleGet = async (
  _: NextApiRequest,
  res: NextApiResponse,
  user: User
) => {
  res.status(200).json(user);
};

const handlePut = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) => {
  const {
    emailNotificationsEnabled,
    emailDailyQuoteEnabled,
    emailContinueReadingEnabled,
    emailChangelogEnabled,
    readingLanguage,
  } = req.body;

  const updateData: Prisma.UserUpdateInput = {};
  if (emailNotificationsEnabled !== undefined) {
    updateData.emailNotificationsEnabled = emailNotificationsEnabled;
  }
  if (emailDailyQuoteEnabled !== undefined) {
    updateData.emailDailyQuoteEnabled = emailDailyQuoteEnabled;
  }
  if (emailContinueReadingEnabled !== undefined) {
    updateData.emailContinueReadingEnabled = emailContinueReadingEnabled;
  }
  if (emailChangelogEnabled !== undefined) {
    updateData.emailChangelogEnabled = emailChangelogEnabled;
  }
  if (readingLanguage !== undefined) {
    if (!isReaderLang(readingLanguage)) {
      return res.status(400).json({ error: "Invalid readingLanguage" });
    }
    updateData.readingLanguage = readingLanguage;
  }

  // Update the user's notification settings
  const updatedUser = await userService.update(user.id, updateData);

  res.status(200).json(updatedUser);
};

const handleDelete = async (
  _: NextApiRequest,
  res: NextApiResponse,
  user: User
) => {
  // Attempt to delete a user's account, bookmarks, notes, readNodes, sessions, and shares.
  try {
    await accountService.deleteMany({ where: { userId: user.id } });
  } catch (error) {
    logger.error("Error attempting to delete accounts", error, { userId: user.id });
  }
  try {
    await bookmarkService.deleteMany({ where: { userId: user.id } });
  } catch (error) {
    logger.error("Error attempting to delete bookmarks", error, { userId: user.id });
  }
  try {
    await noteService.deleteMany({ where: { userId: user.id } });
  } catch (error) {
    logger.error("Error attempting to delete notes", error, { userId: user.id });
  }
  try {
    await sessionService.deleteMany({ where: { userId: user.id } });
  } catch (error) {
    logger.error("Error attempting to delete sessions", error, { userId: user.id });
  }
  try {
    await shareService.deleteMany({ where: { userId: user.id } });
  } catch (error) {
    logger.error("Error attempting to delete shares", error, { userId: user.id });
  }

  // Ensure we error if we can't delete the user.
  await userService.delete({ where: { id: user.id } });

  res.status(204).end();
};

// Handler for the API endpoints.
async function handle(req: NextApiRequest, res: NextApiResponse) {
  const sessionDetails = await getSessionDetails(req, res);
  if (!sessionDetails) return;

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGet(req, res, sessionDetails.user);
    case "PUT":
      return handlePut(req, res, sessionDetails.user);
    case "DELETE":
      return handleDelete(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withSentry(handle);
