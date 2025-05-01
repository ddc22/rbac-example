import { SetMetadata } from "@nestjs/common";
export const REQUIRED_PERMISSIONS_KEY = "required_permissions";
export const ALLOWED_PERMISSIONS_KEY = "allowed_permissions";

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);

export const AllowPermissions = (...permissions: string[]) =>
  SetMetadata(ALLOWED_PERMISSIONS_KEY, permissions);
