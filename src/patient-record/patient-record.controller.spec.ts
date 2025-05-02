import { Test, TestingModule } from "@nestjs/testing";
import { PatientRecordController } from "./patient-record.controller";
import { PatientRecordService } from "./services/patient-record/patient-record.service";

describe("PatientRecordController", () => {
  let controller: PatientRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientRecordController],
      providers: [
        {
          provide: PatientRecordService,
          useValue: {
            getPatientRecords: jest.fn(),
            getPatientRecordById: jest.fn(),
            createPatientRecord: jest.fn(),
            updatePatientRecord: jest.fn(),
            deletePatientRecord: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PatientRecordController>(PatientRecordController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
