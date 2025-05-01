import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PatientRecords } from "src/entities/PatientRecords";
import { Repository } from "typeorm";

@Controller("patient-record")
export class PatientRecordController {
  constructor(
    @InjectRepository(PatientRecords)
    private patientRecordRepository: Repository<PatientRecords>,
  ) {}
  @Get()
  async getPatientRecords() {
    const patientRecords = this.patientRecordRepository.find();
    return patientRecords;
  }
}
