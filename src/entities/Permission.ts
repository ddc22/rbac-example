import { Column, Entity, Index, JoinTable, ManyToMany } from "typeorm";
import { Role } from "./Role";

@Index("permission_pkey", ["id"], { unique: true })
@Entity("permission")
export class Permission {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: "rolePermission",
    joinColumns: [{ name: "permissionId", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "roleId", referencedColumnName: "id" }],
    schema: "public",
  })
  roles: Role[];
}
