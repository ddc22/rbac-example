import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Index("auditLog_pkey", ["id"], { unique: true })
@Index("idx_auditlog_resource_resourceid", ["resource", "resourceId"], {})
@Index("idx_auditlog_timestamp", ["timestamp"], {})
@Index("idx_auditlog_userid", ["userId"], {})
@Entity("auditLog")
export class AuditLog {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("uuid", { name: "userId" })
  userId?: string;

  @Column("character varying", { name: "action", length: 50 })
  action: string;

  @Column("character varying", { name: "resource", length: 255 })
  resource: string;

  @Column("uuid", { name: "resourceId", nullable: true })
  resourceId: string | null;

  @Column("character varying", { name: "status", length: 50 })
  status: string;

  @Column("timestamp without time zone", {
    name: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  timestamp: Date;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
