import { Module } from "@nestjs/common";
import { PatientRecordController } from "./patient-record.controller";

@Module({
  controllers: [PatientRecordController],
})
export class PatientRecordModule {}
