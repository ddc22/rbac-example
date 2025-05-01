import { Column, Entity, Index, OneToMany } from "typeorm";
import { PatientRecords } from "./PatientRecords";
import { User } from "./User";

@Index("organization_pkey", ["id"], { unique: true })
@Entity("organization")
export class Organization {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("integer", { name: "level" })
  level: number;

  @OneToMany(
    () => PatientRecords,
    (patientRecords) => patientRecords.organization
  )
  patientRecords: PatientRecords[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];
}
