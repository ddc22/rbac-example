import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "src/entities/Role";
import { User } from "src/entities/User";
import { UserService } from "src/services/user/user.service";
import { Organization } from "src/entities/Organization";
import { AuditLogService } from "./audit-log/audit-log.service";
import { AuditLog } from "src/entities/AuditLog";

@Global()
@Module({
  providers: [UserService, AuditLogService],
  exports: [UserService, AuditLogService],
  imports: [TypeOrmModule.forFeature([User, Role, Organization, AuditLog])],
})
export class GlobalModule {}
