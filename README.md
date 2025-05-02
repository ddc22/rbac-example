# rbac-example
NestJS based Rbac Example for A patient records system

## How To SetUP this project
### Copy and paste .env.example as .env
### Set up the db and start the project
- npm run setup:db
   - This will
      - 1: start a postgres docker container with env vars
      - 2: run the schema migration and initialize the db schema
      - 3: seed the db with some sample data
npm start
    - Just start the nest project and go to localhost:3000

## Destroy DB 
npm run destroy:db
# Patient Record Management API

## Base URL

```
http://localhost:3000
```

## Authentication

This API uses a simple user ID-based authentication system:

- Add a `user-id` header to your requests with one of the test user IDs listed below
- The user ID can also be hardcoded at `src/cross-cutting-aspects/auth/current-user.ts` for testing purposes
- Different user IDs have different permission levels (see Test User IDs section)

Example header:
```
user-id: ba7c6438-dfca-48ee-9776-93777a59a0e0
```

## Endpoints

### Get Patient Records

Retrieves all patient records.

- **URL**: `/patient-record/`
- **Method**: `GET`
- **Response**: Array of patient records

### Get Single Patient Record

Retrieves a specific patient record by ID.

- **URL**: `/patient-record/{id}`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: UUID of the patient record
- **Example**:
  ```
  /patient-record/692a03b5-50d5-4c24-b4af-4ef7f7181d76
  ```
- **Response**: Patient record object

### Create Patient Record

Creates a new patient record.

- **URL**: `/patient-record`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "id": "string",
    "ownerId": "string",
    "record": {
      "age": 0,
      "diagnosis": "string",
      "treatment": "string",
      "patientName": "string"
    },
    "organizationId": "string"
  }
  ```
- **Example Request**:
  ```json
  {
    "id": "692a03b5-50d5-4c24-b4af-4ef7f7181d77",
    "ownerId": "f743d424-f5f6-40b0-ae09-973597fa8d07",
    "record": {
      "age": 28,
      "diagnosis": "Influenza",
      "treatment": "Rest and fluids",
      "patientName": "Robert Johnson"
    },
    "organizationId": "2907c94e-0147-46e9-ae37-e05704dffdd0"
  }
  ```
- **Response**: Created patient record

### Update Patient Record

Updates an existing patient record.

- **URL**: `/patient-record/{id}`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: UUID of the patient record
- **Request Body**:
  ```json
  {
    "record": {
      "age": 0,
      "diagnosis": "string",
      "treatment": "string",
      "patientName": "string"
    }
  }
  ```
- **Example**:
  ```
  /patient-record/ff67e190-ed45-4702-ab27-7fb005074ef4
  ```
- **Example Request**:
  ```json
  {
    "record": {
      "age": 45,
      "diagnosis": "Hypertension",
      "treatment": "Medication and lifestyle changes",
      "patientName": "John Doe"
    }
  }
  ```
- **Response**: Updated patient record

### Delete Patient Record

Deletes a patient record.

- **URL**: `/patient-record/{id}`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: UUID of the patient record
- **Example**:
  ```
  /patient-record/ff67e190-ed45-4702-ab27-7fb005074ef4
  ```
- **Response**: Confirmation of deletion

## Data Models

### Patient Record

```json
{
  "id": "string",         // UUID
  "ownerId": "string",    // UUID of record owner
  "record": {
    "age": 0,
    "diagnosis": "string",
    "treatment": "string",
    "patientName": "string"
  },
  "organizationId": "string"  // UUID of organization
}
```

## Test User IDs

The API includes hardcoded user IDs for testing purposes. These can be used in the `user-id` header for authentication or as `ownerId` values when creating patient records:

### Available User IDs

- **Level 1 Owner User**: `ba7c6438-dfca-48ee-9776-93777a59a0e0`
  - Has create, read, update, and delete permissions for own records
  - Belongs to Level 1 organization

- **Level 2 Owner User**: `f743d424-f5f6-40b0-ae09-973597fa8d07`
  - Has create, read, update, and delete permissions for own records
  - Belongs to Level 1 organization

- **Level 1 Admin User**: `989159f8-0190-42a8-b7fa-c67bc9510f61`
  - Has create, read, update, and delete permissions for ANY records
  - Belongs to Level 1 organization

- **Level 2 Admin User**: `4984f2c9-5a97-492f-8e71-e9e2f857c218`
  - Has create, read, update, and delete permissions for ANY records
  - Belongs to Level 2 organization

- **Viewer User**: `cb662a05-0b86-4551-959a-b4d8cb407406`
  - Has read-only access to ALL records
  - Belongs to Level 2 organization

- **Unprivileged User**: `c2671f09-6f15-40f3-b258-4d5cd1157305`
  - Has no permissions
  - Belongs to Level 2 organization

### How to Use These IDs

1. **For Authentication**:
   - Include the user ID in the `user-id` header to authenticate with different permission levels
   - Example: `user-id: ba7c6438-dfca-48ee-9776-93777a59a0e0`
   - Alternatively, hardcode the user ID in `src/cross-cutting-aspects/auth/current-user.ts`

2. **For Creating Records**:
   - Use these IDs as the `ownerId` field when creating new patient records
   - Example:
     ```json
     {
       "id": "new-record-uuid",
       "ownerId": "ba7c6438-dfca-48ee-9776-93777a59a0e0",
       "record": {
         "age": 45,
         "diagnosis": "Example Diagnosis",
         "treatment": "Example Treatment",
         "patientName": "Example Patient"
       },
       "organizationId": "org-uuid"
     }
     ```

3. **For Testing Record Access**:
   - Owner users can only access their own records
   - Admin users can access any records
   - Viewer users can read any records but cannot modify them
   - Unprivileged users cannot access any records

4. **For Organization-Level Testing**:
   - Level 1 and Level 2 organizations have different access rules
   - Users belong to specific organization levels

## Notes

- All IDs use UUID format
- The API runs locally on port 3000
- Record operations require appropriate ID parameters in the URL path
- The `record` field contains the actual patient medical information
- The seeding process creates sample patient records for testing