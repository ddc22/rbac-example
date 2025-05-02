// helper/seed.ts
import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

// Import the datasource configuration
import dataSource from "../migrations/datasource";

/**
 * Hardcoded so that its easier to test
 */
const ownerUserId = "ba7c6438-dfca-48ee-9776-93777a59a0e0";
const level2OwnerUserId = "f743d424-f5f6-40b0-ae09-973597fa8d07";
const adminUserId = "989159f8-0190-42a8-b7fa-c67bc9510f61";
const level2AdminUserId = "4984f2c9-5a97-492f-8e71-e9e2f857c218";
const viewerUserId = "cb662a05-0b86-4551-959a-b4d8cb407406";

/**
 * Main seed function
 */
export async function seed() {
  // Initialize connection
  try {
    await dataSource.initialize();
    console.log("Connected to database");
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }

  // Generate UUIDs for reference
  const ownerRoleId = uuidv4();
  const adminRoleId = uuidv4();
  const viewerRoleId = uuidv4();

  // Permissions
  const createRecordId = uuidv4();
  const readOwnRecordId = uuidv4();
  const readAnyRecordId = uuidv4();
  const updateOwnRecordId = uuidv4();
  const updateAnyRecordId = uuidv4();
  const deleteOwnRecordId = uuidv4();
  const deleteAnyRecordId = uuidv4();

  // Organizations
  const level1OrgId = uuidv4();
  const level2OrgId = uuidv4();

  try {
    // Start a transaction
    await dataSource.transaction(async (transactionalEntityManager) => {
      // 1. Create roles
      await transactionalEntityManager.query(`
        INSERT INTO "role" ("id", "name") VALUES 
        ('${ownerRoleId}', 'Owner'),
        ('${adminRoleId}', 'Admin'),
        ('${viewerRoleId}', 'Viewer')
      `);
      console.log("Roles created");

      // 2. Create permissions
      await transactionalEntityManager.query(`
        INSERT INTO "permission" ("id", "name") VALUES 
        ('${createRecordId}', 'create::any::patient_record'),
        ('${readOwnRecordId}', 'read::own::patient_record'),
        ('${readAnyRecordId}', 'read::any::patient_record'),
        ('${updateOwnRecordId}', 'update::own::patient_record'),
        ('${updateAnyRecordId}', 'update::any::patient_record'),
        ('${deleteOwnRecordId}', 'delete::own::patient_record'),
        ('${deleteAnyRecordId}', 'delete::any::patient_record')
      `);
      console.log("Permissions created");

      // 3. Create role-permission relationships based on the matrix
      await transactionalEntityManager.query(`
        -- Owner permissions
        INSERT INTO "rolePermission" ("roleId", "permissionId") VALUES 
        ('${ownerRoleId}', '${createRecordId}'),
        ('${ownerRoleId}', '${readOwnRecordId}'),
        ('${ownerRoleId}', '${updateOwnRecordId}'),
        ('${ownerRoleId}', '${deleteOwnRecordId}'),
        
        -- Admin permissions
        ('${adminRoleId}', '${createRecordId}'),
        ('${adminRoleId}', '${readAnyRecordId}'),
        ('${adminRoleId}', '${updateAnyRecordId}'),
        ('${adminRoleId}', '${deleteAnyRecordId}'),
        
        -- Viewer permissions
        ('${viewerRoleId}', '${readAnyRecordId}')
      `);
      console.log("Role permissions assigned");

      // 4. Create organizations
      await transactionalEntityManager.query(`
        INSERT INTO "organization" ("id", "name", "level") VALUES 
        ('${level1OrgId}', 'Level1', 1),
        ('${level2OrgId}', 'Level2', 2)
      `);
      console.log("Organizations created");

      // 5. Create users
      await transactionalEntityManager.query(`
        INSERT INTO "user" ("id", "name", "roleId", "organizationId") VALUES 
        ('${ownerUserId}', 'Level 1 Owner User', '${ownerRoleId}', '${level1OrgId}'),
        ('${level2OwnerUserId}', 'Level 2 Owner User Id', '${ownerRoleId}', '${level1OrgId}'),
        ('${adminUserId}', 'Level 1 Admin User', '${adminRoleId}', '${level1OrgId}'),
        ('${level2AdminUserId}', 'Level 2 Admin User', '${adminRoleId}', '${level2OrgId}'),
        ('${viewerUserId}', 'Viewer User', '${viewerRoleId}', '${level2OrgId}')
      `);
      console.log("Users created");

      // 6. Create patient records
      await transactionalEntityManager.query(`
        INSERT INTO "patientRecords" ("id", "ownerId", "record", "organizationId") VALUES 
        ('${uuidv4()}', '${ownerUserId}', '{"patientName": "John Doe", "age": 45, "diagnosis": "Hypertension", "treatment": "Medication and lifestyle changes"}', '${level1OrgId}'),
        ('${uuidv4()}', '${ownerUserId}', '{"patientName": "Jane Smith", "age": 32, "diagnosis": "Type 2 Diabetes", "treatment": "Insulin therapy"}', '${level1OrgId}'),
        ('${uuidv4()}', '${level2OwnerUserId}', '{"patientName": "Robert Johnson", "age": 28, "diagnosis": "Influenza", "treatment": "Rest and fluids"}', '${level2OrgId}'),
        ('${uuidv4()}', '${level2OwnerUserId}', '{"patientName": "Robert Johnson", "age": 28, "diagnosis": "Influenza", "treatment": "Rest and fluids"}', '${level2OrgId}')
      `);
      console.log("Patient records created");
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the connection
    await dataSource.destroy();
    console.log("Database connection closed");
  }
}

// Run the seed function
// seed().catch((error) => {
//   console.error("Unhandled error during seeding:", error);
//   process.exit(1);
// });

export {
  ownerUserId,
  adminUserId,
  viewerUserId,
  level2OwnerUserId,
  level2AdminUserId,
};
