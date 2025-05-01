// helper/seed.ts
import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

// Import the datasource configuration
import dataSource from "../migrations/datasource";

/**
 * Main seed function
 */
async function seed() {
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

  const ownerUserId = uuidv4();
  const adminUserId = uuidv4();
  const viewerUserId = uuidv4();

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
        ('${createRecordId}', 'create_record'),
        ('${readOwnRecordId}', 'read_own_record'),
        ('${readAnyRecordId}', 'read_any_record'),
        ('${updateOwnRecordId}', 'update_own_record'),
        ('${updateAnyRecordId}', 'update_any_record'),
        ('${deleteOwnRecordId}', 'delete_own_record'),
        ('${deleteAnyRecordId}', 'delete_any_record')
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
        ('${adminRoleId}', '${readOwnRecordId}'),
        ('${adminRoleId}', '${readAnyRecordId}'),
        ('${adminRoleId}', '${updateOwnRecordId}'),
        ('${adminRoleId}', '${updateAnyRecordId}'),
        ('${adminRoleId}', '${deleteOwnRecordId}'),
        ('${adminRoleId}', '${deleteAnyRecordId}'),
        
        -- Viewer permissions
        ('${viewerRoleId}', '${readOwnRecordId}')
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
        ('${ownerUserId}', 'Owner User', '${ownerRoleId}', '${level1OrgId}'),
        ('${adminUserId}', 'Admin User', '${adminRoleId}', '${level1OrgId}'),
        ('${viewerUserId}', 'Viewer User', '${viewerRoleId}', '${level2OrgId}')
      `);
      console.log("Users created");

      // 6. Create patient records
      await transactionalEntityManager.query(`
        INSERT INTO "patientRecords" ("id", "owner", "record", "organizationId") VALUES 
        ('${uuidv4()}', '${ownerUserId}', '{"patientName": "John Doe", "age": 45, "diagnosis": "Hypertension", "treatment": "Medication and lifestyle changes"}', '${level1OrgId}'),
        ('${uuidv4()}', '${adminUserId}', '{"patientName": "Jane Smith", "age": 32, "diagnosis": "Type 2 Diabetes", "treatment": "Insulin therapy"}', '${level1OrgId}'),
        ('${uuidv4()}', '${viewerUserId}', '{"patientName": "Robert Johnson", "age": 28, "diagnosis": "Influenza", "treatment": "Rest and fluids"}', '${level2OrgId}')
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
seed().catch((error) => {
  console.error("Unhandled error during seeding:", error);
  process.exit(1);
});
