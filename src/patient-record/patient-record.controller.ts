import { Controller, Get } from "@nestjs/common";

@Controller("patient-record")
export class PatientRecordController {
  @Get()
  getPatientRecords() {
    return "Patient Record";
  }
}
