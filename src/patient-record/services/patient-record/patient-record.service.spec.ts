/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  PatientRecordService,
  CreatePatientRecordDto,
  UpdatePatientRecordDto,
} from "./patient-record.service";
import { PatientRecords } from "src/entities/PatientRecords";
import { Organization } from "src/entities/Organization";
import { UserData } from "src/services/user/user-data";
import { Repository } from "typeorm";
import {
  ACTIONS,
  RESOURCES,
  SCOPE,
} from "src/cross-cutting-aspects/auth/authorization-service/permission-structure";
import { User } from "src/entities/User";
import { Permission } from "src/entities/Permission";

let service: PatientRecordService;
let patientRecordRepository: Repository<PatientRecords>;
let organizationRepository: Repository<Organization>;

const mockPatientRecords: PatientRecords[] = [
  {
    id: "1",
    ownerId: "user1",
    record: { name: "John Doe", age: 30 },
    organizationId: "org1",
    organization: { id: "org1", level: 1 } as Organization,
  } as PatientRecords,
  {
    id: "2",
    ownerId: "user2",
    record: { name: "Jane Smith", age: 25 },
    organizationId: "org1",
    organization: { id: "org1", level: 1 } as Organization,
  } as PatientRecords,
];

const mockOrganizations: Organization[] = [
  { id: "org0", level: 0 } as Organization,
  { id: "org1", level: 1 } as Organization,
  { id: "org2", level: 2 } as Organization,
];

const createMockUser = (
  permissions: string[],
  orgLevel: number,
  userId: string = "user1",
) => {
  return new UserData(
    {
      id: userId,
      organization: mockOrganizations[orgLevel],
    } as User,
    permissions.map((p) => ({ name: p })) as Permission[],
  );
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      PatientRecordService,
      {
        provide: getRepositoryToken(PatientRecords),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
      {
        provide: getRepositoryToken(Organization),
        useValue: {
          findOne: jest.fn(),
        },
      },
    ],
  }).compile();

  service = module.get<PatientRecordService>(PatientRecordService);
  patientRecordRepository = module.get<Repository<PatientRecords>>(
    getRepositoryToken(PatientRecords),
  );
  organizationRepository = module.get<Repository<Organization>>(
    getRepositoryToken(Organization),
  );
});

it("should be defined", () => {
  expect(service).toBeDefined();
});

describe("getPatientRecords", () => {
  it("should return all records for admin with any scope and higher org level", async () => {
    const adminUser = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.READ}:${SCOPE.ANY}`],
      1,
      "adminId1",
    );
    jest.spyOn(patientRecordRepository, "find").mockResolvedValue([]);

    await service.getPatientRecords(adminUser);

    expect(patientRecordRepository.find).toHaveBeenCalledWith({
      where: {
        organization: {
          level: expect.objectContaining({
            _type: "moreThanOrEqual",
            _value: 1,
          }),
        },
      },
    });
  });

  it("should return only owned records when user has OWN scope", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.READ}:${SCOPE.OWN}`],
      1,
    );
    jest
      .spyOn(patientRecordRepository, "find")
      .mockResolvedValue([mockPatientRecords[0]]);

    const result = await service.getPatientRecords(user);

    expect(patientRecordRepository.find).toHaveBeenCalledWith({
      where: expect.objectContaining({
        ownerId: "user1",
      }),
    });
    expect(result).toEqual([mockPatientRecords[0]]);
  });

  it("should filter by organization level", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.READ}:${SCOPE.ANY}`],
      2,
    );
    jest.spyOn(patientRecordRepository, "find").mockResolvedValue([]);

    await service.getPatientRecords(user);

    expect(patientRecordRepository.find).toHaveBeenCalledWith({
      where: {
        organization: {
          level: expect.objectContaining({
            _type: "moreThanOrEqual",
            _value: 2,
          }),
        },
      },
    });
  });
});

describe("getPatientRecordById", () => {
  it("should return record by id when user has permission", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.READ}:${SCOPE.ANY}`],
      1,
    );
    jest
      .spyOn(patientRecordRepository, "findOne")
      .mockResolvedValue(mockPatientRecords[0]);

    const result = await service.getPatientRecordById("1", user);

    expect(patientRecordRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: "1",
        organization: {
          level: expect.any(Object),
        },
      },
      relations: ["organization"],
    });
    expect(result).toEqual(mockPatientRecords[0]);
  });

  it("should return null when record not found", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.READ}:${SCOPE.ANY}`],
      1,
    );
    jest.spyOn(patientRecordRepository, "findOne").mockResolvedValue(null);

    const result = await service.getPatientRecordById("999", user);

    expect(result).toBeNull();
  });
});

describe("createPatientRecord", () => {
  it("should create a patient record when user has sufficient org level", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.CREATE}:${SCOPE.ANY}`],
      1,
    );
    const createDto: CreatePatientRecordDto = {
      id: "3",
      ownerId: "user1",
      record: { name: "New Patient", age: 40 },
      organizationId: mockOrganizations[1].id,
    };

    jest
      .spyOn(organizationRepository, "findOne")
      .mockResolvedValue(mockOrganizations[1]);
    jest
      .spyOn(patientRecordRepository, "create")
      .mockReturnValue({ ...createDto } as PatientRecords);

    const result = await service.createPatientRecord(createDto, user);

    expect(organizationRepository.findOne).toHaveBeenCalledWith({
      where: { id: "org1" },
    });
    expect(patientRecordRepository.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual({ ...createDto });
  });

  it("should throw error when organization not found", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.CREATE}:${SCOPE.ANY}`],
      1,
    );
    const createDto: CreatePatientRecordDto = {
      id: "3",
      ownerId: "user1",
      record: { name: "New Patient", age: 40 },
      organizationId: "nonexistent",
    };

    jest.spyOn(organizationRepository, "findOne").mockResolvedValue(null);

    await expect(service.createPatientRecord(createDto, user)).rejects.toThrow(
      "Organization not found",
    );
  });

  it("should throw error when user org level is higher than target org", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.CREATE}:${SCOPE.ANY}`],
      2,
    );
    const createDto: CreatePatientRecordDto = {
      id: "3",
      ownerId: "user1",
      record: { name: "New Patient", age: 40 },
      organizationId: "org1",
    };

    jest
      .spyOn(organizationRepository, "findOne")
      .mockResolvedValue(mockOrganizations[0]);

    await expect(service.createPatientRecord(createDto, user)).rejects.toThrow(
      "User does not have permission to create a record in this organization",
    );
  });
});

describe("updatePatientRecord", () => {
  it("should update a patient record when user has ANY scope", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.UPDATE}:${SCOPE.ANY}`],
      1,
    );
    const updateDto: UpdatePatientRecordDto = {
      record: { name: "Updated Name", age: 35 },
    };

    jest
      .spyOn(patientRecordRepository, "findOne")
      .mockResolvedValue(mockPatientRecords[0]);
    jest
      .spyOn(patientRecordRepository, "update")
      .mockResolvedValue({ affected: 1 } as any);

    const result = await service.updatePatientRecord("1", updateDto, user);

    expect(patientRecordRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: "1",
        organization: {
          level: expect.any(Object),
        },
      },
      relations: ["organization"],
    });
    expect(patientRecordRepository.update).toHaveBeenCalledWith("1", {
      record: updateDto.record,
    });
    expect(result).toEqual({ affected: 1 });
  });

  it("should throw error when record not found", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.UPDATE}:${SCOPE.ANY}`],
      1,
    );
    const updateDto: UpdatePatientRecordDto = {
      record: { name: "Updated Name", age: 35 },
    };

    jest.spyOn(patientRecordRepository, "findOne").mockResolvedValue(null);

    await expect(
      service.updatePatientRecord("999", updateDto, user),
    ).rejects.toThrow(
      "Patient record not found or you don't have permission to update it",
    );
  });
});

describe("deletePatientRecord", () => {
  it("should delete a patient record when user has permission", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.DELETE}:${SCOPE.ANY}`],
      1,
    );

    jest
      .spyOn(patientRecordRepository, "findOne")
      .mockResolvedValue(mockPatientRecords[0]);
    jest
      .spyOn(patientRecordRepository, "delete")
      .mockResolvedValue({ affected: 1 } as any);

    const result = await service.deletePatientRecord("1", user);

    expect(patientRecordRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: "1",
        organization: {
          level: expect.any(Object),
        },
      },
      relations: ["organization"],
    });
    expect(patientRecordRepository.delete).toHaveBeenCalledWith("1");
    expect(result).toEqual({ affected: 1 });
  });

  it("should throw error when record not found", async () => {
    const user = createMockUser(
      [`${RESOURCES.PATIENT_RECORD}:${ACTIONS.DELETE}:${SCOPE.ANY}`],
      1,
    );

    jest.spyOn(patientRecordRepository, "findOne").mockResolvedValue(null);

    await expect(service.deletePatientRecord("999", user)).rejects.toThrow(
      "Patient record not found or you don't have permission to update it",
    );
  });
});
