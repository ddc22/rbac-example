/**
 * DELETE THIS FILE and wire up the current user using the request object
 */
import {
  adminUserId,
  level2AdminUserId,
  level2OwnerUserId,
  ownerUserId,
} from "helper/seed";

export const CURRENT_USER_KEY = level2OwnerUserId;
