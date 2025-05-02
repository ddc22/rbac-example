import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  ALLOWED_PERMISSIONS_KEY,
  REQUIRED_PERMISSIONS_KEY,
} from "./decorators/permission.decorator";
import { UserService } from "src/services/user/user.service";
import { resolveCurrentUser } from "./current-user";
import {
  AuditLogService,
  RequestAuditLog,
} from "../global/audit-log/audit-log.service";
import { UserData } from "src/services/user/user-data";

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
      const result = true;
      const requestAuditLog: RequestAuditLog = this.createRequestAuditLog(
        context,
        result,
        {
          requiredPermissions,
          allowedPermissions,
        },
        undefined,
      );

      await this.auditLogService.logRequest(requestAuditLog);
      console.log({
        result,
        requiredPermissions,
        allowedPermissions,
      });
      return result;
    }

    const user = await this.userService.getUser(
      resolveCurrentUser(context.switchToHttp().getRequest()),
    );

    if (
      !user ||
      !user.permissions ||
      (allowedPermissions.length > 0 && !user.permissions.length)
    ) {
      const result = false;
      const requestAuditLog: RequestAuditLog = this.createRequestAuditLog(
        context,
        result,
        {
          requiredPermissions,
          allowedPermissions,
        },
        user ?? undefined,
      );

      await this.auditLogService.logRequest(requestAuditLog);
      return result;
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
    const requestAuditLog: RequestAuditLog = this.createRequestAuditLog(
      context,
      result,
      {
        requiredPermissions,
        allowedPermissions,
        userPermissionNames,
      },
      user,
    );

    await this.auditLogService.logRequest(requestAuditLog);

    return result;
  }

  private createRequestAuditLog(
    context: ExecutionContext,
    result: boolean,

    extra: {
      requiredPermissions?: string[];
      allowedPermissions?: string[];
      userPermissionNames?: string[];
    },
    user?: UserData,
  ): RequestAuditLog {
    const request = context.switchToHttp().getRequest();

    return {
      userId: user?.info.id,
      method: request.method,
      resource: request.path,
      accessGranted: result,
      resourceId: request.params.id,
      extra: {
        ip: request.ip,
        userAgent: request.headers["user-agent"],
        controllerName: context.getClass().name,
        handlerName: context.getHandler().name,
        ...extra, // Spread the extra permissions data into the extra object
      },
    };
  }
}
