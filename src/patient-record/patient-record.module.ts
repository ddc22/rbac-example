import { Module } from "@nestjs/common";
import { PatientRecordController } from "./patient-record.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientRecords } from "src/entities/PatientRecords";
import { PatientRecordService } from "./services/patient-record/patient-record.service";

@Module({
  controllers: [PatientRecordController],
  imports: [TypeOrmModule.forFeature([PatientRecords])],
  providers: [PatientRecordService],
})
export class PatientRecordModule {}
