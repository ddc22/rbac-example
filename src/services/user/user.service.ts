import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Permission } from "src/entities/Permission";
import { Role } from "src/entities/Role";
import { User } from "src/entities/User";
import { Repository } from "typeorm";

export type UserData = {
  info: User;
  permissions: Permission[];
};
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getUser(userId: string): Promise<UserData | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return null;
    }

    const role = await this.roleRepository.findOne({
      where: { id: user?.roleId },
      relations: ["permissions"],
    });

    const result = {
      info: user,
      permissions: role?.permissions ?? [],
    };

    return result;
  }
}
