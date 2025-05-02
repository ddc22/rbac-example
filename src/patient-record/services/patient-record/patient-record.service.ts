/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PatientRecords } from "src/entities/PatientRecords";
import { MoreThan, MoreThanOrEqual, Or, Repository } from "typeorm";
import {
  ACTIONS,
  RESOURCES,
  SCOPE,
} from "src/cross-cutting-aspects/auth/authorization-service/permission-structure";
import { UserData } from "src/services/user/user-data";
import { Organization } from "src/entities/Organization";
export class UpdatePatientRecordDto {
  record: Record<string, any>;
}

export class CreatePatientRecordDto {
  id: string;
  ownerId: string;
  record: Record<string, any>;
  organizationId: string;
}

@Injectable()
export class PatientRecordService {
  constructor(
    @InjectRepository(PatientRecords)
    private patientRecordRepository: Repository<PatientRecords>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async getPatientRecords(user: UserData) {
    const recordReadPermissions = user.filterPermissions(
      RESOURCES.PATIENT_RECORD,
      ACTIONS.READ,
    );
    const whereCondition = this.buildWhereCondition(user, ACTIONS.READ);

    const patientRecords = await this.patientRecordRepository.find({
      where: whereCondition,
    });
    return patientRecords;
  }

  async getPatientRecordById(id: string, user: UserData) {
    const whereCondition = this.buildWhereCondition(user, ACTIONS.READ);

    whereCondition.id = id;
    const patientRecords = await this.patientRecordRepository.findOne({
      where: whereCondition,
      relations: ["organization"],
    });

    return patientRecords;
  }

  async createPatientRecord(
    createPatientRecordDto: CreatePatientRecordDto,
    user: UserData,
  ) {
    const userOrgLevel = user.info.organization.level;
    const organization = await this.organizationRepository.findOne({
      where: {
        id: createPatientRecordDto.organizationId,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (userOrgLevel > organization?.level) {
      throw new Error(
        "User does not have permission to create a record in this organization",
      );
    }

    const patientRecord = this.patientRecordRepository.create(
      createPatientRecordDto,
    );
    return patientRecord;
  }

  async updatePatientRecord(
    id: string,
    patientRecord: UpdatePatientRecordDto,
    user: UserData,
  ) {
    const whereCondition = this.buildWhereCondition(user, ACTIONS.UPDATE);
    const recordToUpdate = await this.patientRecordRepository.findOne({
      where: {
        id,
        ...whereCondition,
      },
      relations: ["organization"],
    });

    if (!recordToUpdate) {
      throw new Error(
        "Patient record not found or you don't have permission to update it",
      );
    }

    const patientRecordResult = await this.patientRecordRepository.update(id, {
      record: patientRecord.record,
    });

    if (!patientRecordResult) {
      throw new Error("Patient record not found");
    }
    return patientRecordResult;
  }

  async deletePatientRecord(id: string, user: UserData) {
    const whereCondition = this.buildWhereCondition(user, ACTIONS.DELETE);
    const recordToDelete = await this.patientRecordRepository.findOne({
      where: {
        id,
        ...whereCondition,
      },
      relations: ["organization"],
    });

    if (!recordToDelete) {
      throw new Error(
        "Patient record not found or you don't have permission to update it",
      );
    }

    const patientRecord = this.patientRecordRepository.delete(id);
    return patientRecord;
  }

  private buildWhereCondition(
    user: UserData,
    action: string,
  ): Record<string, any> {
    const recordReadPermissions = user.filterPermissions(
      RESOURCES.PATIENT_RECORD,
      action,
    );
    const whereCondition: Record<string, any> = {
      organization: {
        level: MoreThanOrEqual(user.info.organization.level),
      },
    };

    /**
     * If the user does not have the permission at any scope
     * then they can only perform action on their own records
     */
    if (
      !recordReadPermissions.find((p) => p.includes(SCOPE.ANY)) &&
      recordReadPermissions.find((p) => p.includes(SCOPE.OWN))
    ) {
      whereCondition.ownerId = user.info.id;
    }

    return whereCondition;
  }
}
