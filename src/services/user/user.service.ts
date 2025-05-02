import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "src/entities/Role";
import { User } from "src/entities/User";
import { Repository } from "typeorm";
import { UserData } from "./user-data";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getUser(userId: string): Promise<UserData | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["organization"],
    });

    if (!user) {
      return null;
    }

    const role = await this.roleRepository.findOne({
      where: { id: user?.roleId },
      relations: ["permissions"],
    });

    const result = new UserData(user, role?.permissions ?? []);
    return result;
  }
}
