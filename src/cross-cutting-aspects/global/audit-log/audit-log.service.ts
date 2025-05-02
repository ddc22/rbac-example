import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuditLog } from "src/entities/AuditLog";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

export type RequestAuditLog = {
  userId: string;
  method: string;
  resource: string;
  resourceId: string;
  accessGranted: boolean;
  extra: {
    ip: string;
    userAgent: string;
    requiredPermissions: string[];
    allowedPermissions: string[];
    controllerName: string;
    handlerName: string;
    userPermissions?: string[];
    reason?: string;
  };
};

const methodToAction = {
  GET: "READ",
  POST: "CREATE",
  PUT: "UPDATE",
  DELETE: "DELETE",
  PATCH: "UPDATE",
};

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  logRequest(payload: RequestAuditLog) {
    const auditLog = new AuditLog();
    auditLog.id = uuidv4();
    auditLog.userId = payload.userId;
    auditLog.action = methodToAction[payload.method] ?? "UNKNOWN";
    auditLog.resource = payload.resource;
    auditLog.resource = payload.resourceId;
    auditLog.status = payload.accessGranted ? "SUCCESS" : "FAILURE";
    auditLog.timestamp = new Date();
    auditLog.metadata = {
      ip: payload.extra.ip,
      userAgent: payload.extra.userAgent,
      requiredPermissions: payload.extra.requiredPermissions,
      allowedPermissions: payload.extra.allowedPermissions,
      controllerName: payload.extra.controllerName,
      handlerName: payload.extra.handlerName,
      userPermissions: payload.extra.userPermissions,
      reason: payload.extra.reason,
    };

    return this.auditLogRepo.save<AuditLog>(auditLog);
  }
}
