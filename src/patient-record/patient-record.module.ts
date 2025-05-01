import { Module } from "@nestjs/common";
import { PatientRecordController } from "./patient-record.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientRecords } from "src/entities/PatientRecords";

@Module({
  controllers: [PatientRecordController],
  imports: [TypeOrmModule.forFeature([PatientRecords])],
})
export class PatientRecordModule {}
