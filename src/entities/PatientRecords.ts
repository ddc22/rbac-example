import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

@Index("patientRecords_pkey", ["id"], { unique: true })
@Index("idx_patientrecords_organizationid", ["organizationId"], {})
@Index("idx_patientrecords_owner", ["owner"], {})
@Entity("patientRecords")
export class PatientRecords {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("uuid", { name: "owner" })
  owner: string;

  @Column("jsonb", { name: "record" })
  record: object;

  @Column("uuid", { name: "organizationId" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.patientRecords)
  @JoinColumn([{ name: "organizationId", referencedColumnName: "id" }])
  organization: Organization;

  @ManyToOne(() => User, (user) => user.patientRecords)
  @JoinColumn([{ name: "owner", referencedColumnName: "id" }])
  owner2: User;
}
