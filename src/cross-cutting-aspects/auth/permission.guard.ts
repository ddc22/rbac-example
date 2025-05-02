import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  ALLOWED_PERMISSIONS_KEY,
  REQUIRED_PERMISSIONS_KEY,
} from "./decorators/permission.decorator";
import { UserService } from "src/services/user/user.service";
import { CURRENT_USER_KEY } from "./current-user";
import {
  AuditLogService,
  RequestAuditLog,
} from "../global/audit-log/audit-log.service";

@Injectable()
export class PermissionGuardService implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private auditLogService: AuditLogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    const allowedPermissions =
      this.reflector.getAllAndOverride<string[]>(ALLOWED_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (requiredPermissions.length === 0 && allowedPermissions.length === 0) {
      return true;
    }

    const user = await this.userService.getUser(CURRENT_USER_KEY);

    if (!user || !user.permissions) {
      return false;
    }

    const userPermissionNames = user.permissions.map((p) => p.name);

    const hasRequiredPermissions =
      requiredPermissions.length === 0 ||
      requiredPermissions.every((permission) =>
        userPermissionNames.includes(permission),
      );

    const hasAllowedPermissions =
      allowedPermissions.length === 0 ||
      allowedPermissions.some((permission) =>
        userPermissionNames.includes(permission),
      );

    const result = hasRequiredPermissions && hasAllowedPermissions;
    const request = context.switchToHttp().getRequest();
    const requestAuditLog: RequestAuditLog = {
      userId: user.info.id,
      method: request.method,
      resource: context.getClass().name,
      accessGranted: result,
      resourceId: request.params.id,
      extra: {
        ip: context.switchToHttp().getRequest().ip,
        userAgent: context.switchToHttp().getRequest().headers["user-agent"],
        requiredPermissions,
        allowedPermissions,
        controllerName: context.getClass().name,
        handlerName: context.getHandler().name,
        userPermissions: userPermissionNames,
      },
    };

    await this.auditLogService.logRequest(requestAuditLog);

    return result;
  }
}
