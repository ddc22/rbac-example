import { Column, Entity, Index, ManyToMany } from "typeorm";
import { Role } from "./Role";

@Index("permission_pkey", ["id"], { unique: true })
@Entity("permission")
export class Permission {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
