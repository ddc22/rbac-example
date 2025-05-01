import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { PatientRecords } from "./PatientRecords";
import { Organization } from "./Organization";
import { Role } from "./Role";

@Index("user_pkey", ["id"], { unique: true })
@Index("idx_user_organizationid", ["organizationId"], {})
@Index("idx_user_roleid", ["roleId"], {})
@Entity("user")
export class User {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("uuid", { name: "roleId" })
  roleId: string;

  @Column("uuid", { name: "organizationId" })
  organizationId: string;

  @OneToMany(() => PatientRecords, (patientRecords) => patientRecords.owner2)
  patientRecords: PatientRecords[];

  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn([{ name: "organizationId", referencedColumnName: "id" }])
  organization: Organization;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn([{ name: "roleId", referencedColumnName: "id" }])
  role: Role;
}
