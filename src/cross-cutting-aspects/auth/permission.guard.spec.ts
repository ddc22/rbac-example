/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { UserService } from "src/services/user/user.service";
import { AuditLogService } from "../global/audit-log/audit-log.service";
import { ExecutionContext } from "@nestjs/common";
import { UserData } from "src/services/user/user-data";
import { PermissionGuardService } from "./permission.guard";

jest.mock("./current-user", () => ({
  resolveCurrentUser: jest.fn().mockReturnValue("user1"),
}));

describe("PermissionGuardService", () => {
  let service: PermissionGuardService;
  let reflector: Reflector;
  let userService: UserService;
  let auditLogService: AuditLogService;
  let mockContext: ExecutionContext;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PermissionGuardService,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: UserService, useValue: { getUser: jest.fn() } },
        { provide: AuditLogService, useValue: { logRequest: jest.fn() } },
      ],
    }).compile();

    service = module.get(PermissionGuardService);
    reflector = module.get(Reflector);
    userService = module.get(UserService);
    auditLogService = module.get(AuditLogService);

    auditLogService.logRequest = jest.fn();
    mockContext = {
      getHandler: jest.fn().mockReturnValue({ name: "handler" }),
      getClass: jest.fn().mockReturnValue({ name: "Controller" }),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: "user1" },
          method: "GET",
          path: "/test",
          params: { id: "resource1" },
          ip: "127.0.0.1",
          headers: { "user-agent": "test-agent" },
        }),
      }),
    } as unknown as ExecutionContext;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should allow when no permissions are required", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([]);
    jest
      .spyOn(auditLogService, "logRequest")
      .mockResolvedValue(undefined as any);

    const result = await service.canActivate(mockContext);

    expect(result).toBe(true);
    expect(auditLogService.logRequest).toHaveBeenCalled();
  });

  it("should deny when user is not found", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValueOnce(["read::any::resource"])
      .mockReturnValueOnce([]);
    jest.spyOn(userService, "getUser").mockResolvedValue(null);

    const result = await service.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it("should deny when user has no permissions but allowed permissions are required", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["read::any::resource"]);

    const mockUser = {
      info: { id: "user1" },
      permissions: [],
    } as unknown as UserData;
    jest.spyOn(userService, "getUser").mockResolvedValue(mockUser);

    const result = await service.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it("should allow when user has all required permissions", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValueOnce(["read::any::resource", "update::any::resource"])
      .mockReturnValueOnce([]);

    const mockUser = {
      info: { id: "user1" },
      permissions: [
        { name: "read::any::resource" },
        { name: "update::any::resource" },
      ],
    } as unknown as UserData;
    jest.spyOn(userService, "getUser").mockResolvedValue(mockUser);

    const result = await service.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should allow when user has at least one allowed permission", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["read::any::resource", "admin::resource"]);

    const mockUser = {
      info: { id: "user1" },
      permissions: [{ name: "read::any::resource" }],
    } as unknown as UserData;
    jest.spyOn(userService, "getUser").mockResolvedValue(mockUser);

    const result = await service.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should deny when user lacks some required permissions", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValueOnce(["read::any::resource", "admin::resource"])
      .mockReturnValueOnce([]);

    const mockUser = {
      info: { id: "user1" },
      permissions: [{ name: "read::any::resource" }],
    } as unknown as UserData;
    jest.spyOn(userService, "getUser").mockResolvedValue(mockUser);

    const result = await service.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it("should deny when user lacks any allowed permissions", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["admin::resource", "superuser::resource"]);

    const mockUser = {
      info: { id: "user1" },
      permissions: [{ name: "read::any::resource" }],
    } as unknown as UserData;
    jest.spyOn(userService, "getUser").mockResolvedValue(mockUser);

    const result = await service.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it("should require both required and allowed permissions", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValueOnce(["read::any::resource"])
      .mockReturnValueOnce(["admin::resource", "moderator::resource"]);

    const mockUser = {
      info: { id: "user1" },
      permissions: [
        { name: "read::any::resource" },
        { name: "moderator::resource" },
      ],
    } as unknown as UserData;
    jest.spyOn(userService, "getUser").mockResolvedValue(mockUser);

    const result = await service.canActivate(mockContext);

    expect(result).toBe(true);
  });
});
