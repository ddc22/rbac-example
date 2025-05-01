/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PatientRecords } from "src/entities/PatientRecords";
import { Repository } from "typeorm";
import { UserData } from "../../../services/user/user.service";
export class PatientRecordDto {
  recordId: string;
  record: object;
  organizationId: string;
}

@Injectable()
export class PatientRecordService {
  constructor(
    @InjectRepository(PatientRecords)
    private patientRecordRepository: Repository<PatientRecords>,
  ) {}

  async getPatientRecords(user: UserData) {
    const patientRecords = await this.patientRecordRepository.find();
    return patientRecords;
  }

  async getPatientRecordById(id: string, user: UserData) {
    const patientRecords = await this.patientRecordRepository.findOne({
      where: { id: id },
    });
    return patientRecords;
  }

  createPatientRecord(
    createPatientRecordDto: PatientRecordDto,
    user: UserData,
  ) {
    const patientRecord = this.patientRecordRepository.create(
      createPatientRecordDto,
    );
    return patientRecord;
  }

  updatePatientRecord(
    id: string,
    patientRecord: PatientRecordDto,
    user: UserData,
  ) {
    const patientRecordResult = this.patientRecordRepository.update(
      user.info.id,
      patientRecord,
    );
    return patientRecordResult;
  }

  async deletePatientRecord(id: string, user: UserData) {
    const patientRecord = this.patientRecordRepository.delete(id);
    return patientRecord;
  }
}
