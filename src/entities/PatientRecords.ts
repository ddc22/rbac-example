import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

@Index("patientRecords_pkey", ["id"], { unique: true })
@Entity("patientRecords")
export class PatientRecords {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("uuid", { name: "ownerId" })
  ownerId: string;

  @Column("jsonb", { name: "record" })
  record: object;

  @Column("uuid", { name: "organizationId" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.patientRecords)
  @JoinColumn([{ name: "organizationId", referencedColumnName: "id" }])
  organization: Organization;

  @ManyToOne(() => User, (user) => user.patientRecords)
  @JoinColumn([{ name: "ownerId", referencedColumnName: "id" }])
  owner: User;
}
