/**
 * DELETE THIS FILE and wire up the current user using the request object
 */
import {
  adminUserId,
  level2AdminUserId,
  level2OwnerUserId,
  ownerUserId,
  unprivilegedUserId,
} from "helper/seed";

export const CURRENT_USER_KEY = adminUserId;

export function resolveCurrentUser(request: Request): string {
  const userId = request.headers["user-id"] as string;
  if (!userId) {
    return CURRENT_USER_KEY;
  }
  return userId;
}
