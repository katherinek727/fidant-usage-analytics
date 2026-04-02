import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { users } from "@prisma/client";

/**
 * Resolves the authenticated user from the request.
 *
 * NOTE: This is a development-time stub using the `x-user-id` header.
 * In production, replace with proper JWT/session validation
 * (e.g. NextAuth, Clerk, or a custom JWT middleware).
 */
export async function getAuthenticatedUser(
  req: NextRequest
): Promise<users | null> {
  const rawId = req.headers.get("x-user-id");
  if (!rawId) return null;

  const userId = parseInt(rawId, 10);
  if (isNaN(userId)) return null;

  return prisma.users.findUnique({ where: { id: userId } });
}
