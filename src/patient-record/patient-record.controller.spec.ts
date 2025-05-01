import { Test, TestingModule } from '@nestjs/testing';
import { PatientRecordController } from './patient-record.controller';

describe('PatientRecordController', () => {
  let controller: PatientRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientRecordController],
    }).compile();

    controller = module.get<PatientRecordController>(PatientRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
