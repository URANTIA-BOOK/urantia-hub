// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth/next";
// Relative modules.
import { isAuthEnabled } from "@/libs/authEnabled";
import UserService from "@/services/user";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const userService = new UserService();

const getSessionDetails = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options?: { isAdmin?: boolean; skipUnauthorized?: boolean }
): Promise<{ session: Session; user: User } | undefined> => {
  if (!isAuthEnabled()) {
    if (!options?.skipUnauthorized)
      res.status(401).json({ message: "Unauthorized" });
    return;
  }

  let session: Session | null = null;
  try {
    session = await getServerSession(req, res, authOptions);
  } catch (error) {
    console.error("[getSessionDetails] session failed", error);
    if (!options?.skipUnauthorized)
      res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!session?.user?.email) {
    if (!options?.skipUnauthorized)
      res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Retrieve the user ID from the database
  const user = await userService.find({
    where: { email: session?.user?.email },
    include: {
      userInterests: {
        orderBy: {
          label: {
            name: "asc",
          },
        },
        include: {
          label: {
            include: {
              papers: true,
            },
          },
        },
      },
    },
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (options?.isAdmin && !user.isAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  return { session, user };
};

export default getSessionDetails;
