import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = "permission_key";

/**
 * Decorator to set permission metadata on a class or method.
 * @param permissions - The permissions to set.
 * @returns A decorator function.
 */
export const AllowedPermissions = (...permissions: string[]) => {
  return SetMetadata(PERMISSION_KEY, permissions);
};
