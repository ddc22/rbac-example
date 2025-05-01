import { Test, TestingModule } from '@nestjs/testing';
import { PatientRecordService } from './patient-record.service';

describe('PatientRecordService', () => {
  let service: PatientRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientRecordService],
    }).compile();

    service = module.get<PatientRecordService>(PatientRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
