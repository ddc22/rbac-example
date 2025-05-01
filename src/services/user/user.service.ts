import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/User";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private patientRecordRepository: Repository<User>,
  ) {}

  async getUsers() {
    const user = await this.patientRecordRepository.find();
    return user;
  }
}
