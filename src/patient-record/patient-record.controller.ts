import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CurrentUser } from "src/cross-cutting-aspects/auth/decorators/current-user.decorator";
import { PatientRecords } from "src/entities/PatientRecords";
import { UserData, UserService } from "src/services/user/user.service";
import { Repository } from "typeorm";

@Controller("patient-record")
export class PatientRecordController {
  constructor(
    @InjectRepository(PatientRecords)
    private patientRecordRepository: Repository<PatientRecords>,
    private userService: UserService,
  ) {}
  @Get()
  async getPatientRecords(@CurrentUser() injectedUser: UserData) {
    const patientRecords = await this.patientRecordRepository.find();
    return { patientRecords, injectedUser };
  }
}
