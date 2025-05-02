import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1746069225075 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- Create base tables
        CREATE TABLE "role" (
            "id" UUID PRIMARY KEY,
            "name" VARCHAR(255) NOT NULL
        );

        CREATE TABLE "permission" (
            "id" UUID PRIMARY KEY,
            "name" VARCHAR(255) NOT NULL
        );

        CREATE TABLE "organization" (
            "id" UUID PRIMARY KEY,
            "name" VARCHAR(255) NOT NULL,
            "level" INTEGER NOT NULL
        );

        CREATE TABLE "user" (
            "id" UUID PRIMARY KEY,
            "name" VARCHAR(255) NOT NULL,
            "roleId" UUID NOT NULL,
            "organizationId" UUID NOT NULL,
            CONSTRAINT "user_roleid_foreign" FOREIGN KEY("roleId") REFERENCES "role"("id"),
            CONSTRAINT "user_organizationid_foreign" FOREIGN KEY("organizationId") REFERENCES "organization"("id")
        );

        CREATE TABLE "patientRecords" (
            "id" UUID PRIMARY KEY,
            "ownerId" UUID NOT NULL,
            "record" JSONB NOT NULL,
            "organizationId" UUID NOT NULL,
            CONSTRAINT "patientrecords_owner_foreign" FOREIGN KEY("ownerId") REFERENCES "user"("id"),
            CONSTRAINT "patientrecords_organizationid_foreign" FOREIGN KEY("organizationId") REFERENCES "organization"("id")
        );

        -- Create join table with composite primary key
        CREATE TABLE "rolePermission" (
            "roleId" UUID NOT NULL,
            "permissionId" UUID NOT NULL,
            PRIMARY KEY ("roleId", "permissionId"),
            CONSTRAINT "rolepermission_roleid_foreign" FOREIGN KEY("roleId") REFERENCES "role"("id"),
            CONSTRAINT "rolepermission_permissionid_foreign" FOREIGN KEY("permissionId") REFERENCES "permission"("id")
        );

        -- Create audit log table
        CREATE TABLE "auditLog" (
            "id" UUID PRIMARY KEY,
            "userId" UUID NOT NULL,
            "action" VARCHAR(50) NOT NULL,
            "resource" VARCHAR(255) NOT NULL,
            "resourceId" UUID,
            "status" VARCHAR(50) NOT NULL,
            "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "metadata" JSONB,
            CONSTRAINT "auditlog_userid_foreign" FOREIGN KEY("userId") REFERENCES "user"("id")
        );
        
        -- Create index for querying logs by user
        CREATE INDEX "idx_auditlog_userid" ON "auditLog"("userId");
        
        -- Create index for timestamp to support log retrieval by time periods
        CREATE INDEX "idx_auditlog_timestamp" ON "auditLog"("timestamp");
        
        -- Create composite index for resource + resourceId for efficient resource-specific queries
        CREATE INDEX "idx_auditlog_resource_resourceid" ON "auditLog"("resource", "resourceId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- Drop tables in reverse order of creation to respect foreign key constraints
        DROP TABLE IF EXISTS "rolePermission";
        DROP TABLE IF EXISTS "patientRecords";
        DROP TABLE IF EXISTS "user";
        DROP TABLE IF EXISTS "permission";
        DROP TABLE IF EXISTS "role";
        DROP TABLE IF EXISTS "organization";
    `);
  }
}
