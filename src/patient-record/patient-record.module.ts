import { Module } from "@nestjs/common";
import { PatientRecordController } from "./patient-record.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientRecords } from "src/entities/PatientRecords";
import { PatientRecordService } from "./services/patient-record/patient-record.service";
import { Organization } from "src/entities/Organization";

@Module({
  controllers: [PatientRecordController],
  imports: [TypeOrmModule.forFeature([PatientRecords, Organization])],
  providers: [PatientRecordService],
})
export class PatientRecordModule {}
