import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { Permission } from "./Permission";
import { User } from "./User";

@Index("role_pkey", ["id"], { unique: true })
@Entity("role")
export class Role {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: "rolePermission",
    joinColumns: [{ name: "roleId", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "permissionId", referencedColumnName: "id" }],
    schema: "public",
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
