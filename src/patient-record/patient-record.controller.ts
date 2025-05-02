import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { CurrentUser } from "src/cross-cutting-aspects/auth/decorators/current-user.decorator";
import {
  UpdatePatientRecordDto,
  PatientRecordService,
  CreatePatientRecordDto,
} from "./services/patient-record/patient-record.service";
import {
  AllowPermissions,
  RequirePermissions,
} from "src/cross-cutting-aspects/auth/decorators/permission.decorator";
import { UserData } from "src/services/user/user-data";

@Controller("patient-record")
export class PatientRecordController {
  constructor(private patientRecordService: PatientRecordService) {}
  @Get()
  @AllowPermissions("read::own::patient_record", "read::any::patient_record")
  async getPatientRecords(@CurrentUser() user: UserData) {
    const patientRecords =
      await this.patientRecordService.getPatientRecords(user);
    return patientRecords;
  }

  @Get(":id")
  @AllowPermissions("read::own::patient_record", "read::any::patient_record")
  async getPatientRecord(
    @Param("id") id: string,
    @CurrentUser() user: UserData,
  ) {
    const patientRecord = await this.patientRecordService.getPatientRecordById(
      id,
      user,
    );

    if (!patientRecord) {
      throw new HttpException("Patient record not found", HttpStatus.NOT_FOUND);
    }

    return patientRecord;
  }

  @Post()
  @RequirePermissions("create::any::patient_record")
  createPatientRecord(
    @Body() createPatientRecordDto: CreatePatientRecordDto,
    @CurrentUser() user: UserData,
  ) {
    const newPatientRecord = this.patientRecordService.createPatientRecord(
      createPatientRecordDto,
      user,
    );

    return newPatientRecord;
  }

  @Put(":id")
  @AllowPermissions(
    "update::own::patient_record",
    "update::any::patient_record",
  )
  async updatePatientRecord(
    @Param("id") id: string,
    @Body() updatePatientRecordDto: UpdatePatientRecordDto,
    @CurrentUser() user: UserData,
  ) {
    const updatedRecord = await this.patientRecordService.updatePatientRecord(
      id,
      updatePatientRecordDto,
      user,
    );

    return updatedRecord;
  }

  @Delete(":id")
  @AllowPermissions(
    "delete::own::patient_record",
    "delete::any::patient_record",
  )
  async deletePatientRecord(
    @Param("id") id: string,
    @CurrentUser() user: UserData,
  ) {
    const result = await this.patientRecordService.deletePatientRecord(
      id,
      user,
    );

    if (!result) {
      throw new HttpException(
        "Patient record not found or you don't have permission to delete it",
        HttpStatus.FORBIDDEN,
      );
    }

    return { message: "Patient record deleted successfully", id };
  }
}
