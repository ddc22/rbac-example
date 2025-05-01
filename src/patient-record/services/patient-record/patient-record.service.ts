/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PatientRecords } from "src/entities/PatientRecords";
import { MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import {
  ACTIONS,
  RESOURCES,
  SCOPE,
} from "src/cross-cutting-aspects/auth/authorization-service/permission-structure";
import { UserData } from "src/services/user/user-data";
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
    const recordReadPermissions = user.filterPermissions(
      RESOURCES.PATIENT_RECORD,
      ACTIONS.READ,
    );
    const whereCondition: Record<string, any> = {};
    whereCondition.organization = {
      level: MoreThanOrEqual(user.info.organization.level),
    };
    if (
      !recordReadPermissions.find((p) => p.includes(SCOPE.ANY)) &&
      recordReadPermissions.find((p) => p.includes(SCOPE.OWN))
    ) {
      whereCondition.ownerId = user.info.id;
    }

    console.log({
      whereCondition,
      recordReadPermissions,
      all: user.permissions,
    });

    const patientRecords = await this.patientRecordRepository.findOne({
      where: { id: id, organizationId: user.info.organizationId },
      relations: ["organization"],
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
