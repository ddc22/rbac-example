import { Permission } from "src/entities/Permission";
import { User } from "src/entities/User";

export class UserData {
  info: User;
  permissions: Permission[];

  constructor(info: User, permissions: Permission[]) {
    this.info = info;
    this.permissions = permissions;
  }

  filterPermissions(resource: string, action: string): string[] {
    console.log({ p: this.permissions });
    return this.permissions
      .filter(
        (permission) =>
          permission.name.includes(resource) &&
          permission.name.includes(action),
      )
      .map((permission) => permission.name);
  }
}
