import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PatientRecords } from "src/entities/PatientRecords";
import { UserService } from "src/services/user/user.service";
import { Repository } from "typeorm";

@Controller("patient-record")
export class PatientRecordController {
  constructor(
    @InjectRepository(PatientRecords)
    private patientRecordRepository: Repository<PatientRecords>,
    private userService: UserService,
  ) {}
  @Get()
  async getPatientRecords() {
    const patientRecords = await this.patientRecordRepository.find();
    const users = await this.userService.getUsers();
    return { users, patientRecords };
  }
}
