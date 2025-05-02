
# RBAC Example with NestJS

NestJS-based RBAC example for a patient records system.



# Table of Contents

- [RBAC Example with NestJS](#rbac-example-with-nestjs)
- [Table of Contents](#table-of-contents)
- [Setup instructions](#setup-instructions)
    - [Starting Up](#starting-up)
    - [Destroy Database](#destroy-database)
    - [Generating entities if changes are done](#generating-entities-if-changes-are-done)
- [API documentation](#api-documentation)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)
    - [Get Patient Records](#get-patient-records)
    - [Get Single Patient Record](#get-single-patient-record)
    - [Create Patient Record](#create-patient-record)
    - [Update Patient Record](#update-patient-record)
    - [Delete Patient Record](#delete-patient-record)
  - [Test User IDs](#test-user-ids)
    - [Available User IDs](#available-user-ids)
    - [How to Use These IDs](#how-to-use-these-ids)
  - [Notes](#notes)
- [Description of the data model](#description-of-the-data-model)
  - [ER Diagram](#er-diagram)
    - [Improvements required here](#improvements-required-here)
- [Explanation of access control implementation](#explanation-of-access-control-implementation)
    - [Controller Guards](#controller-guards)
    - [Filtering Guards](#filtering-guards)
    - [Where is the permission processor class?](#where-is-the-permission-processor-class)
    - [How do we resolve organizational access problem](#how-do-we-resolve-organizational-access-problem)
    - [The other scoping approach](#the-other-scoping-approach)
- [Future Considerations for Data Access](#future-considerations-for-data-access)
  - [How to extended to handle more complex scenarios](#how-to-extended-to-handle-more-complex-scenarios)
  - [Security and other considerations for a production environment](#security-and-other-considerations-for-a-production-environment)
  - [Performance optimizations for permission checking at scale](#performance-optimizations-for-permission-checking-at-scale)
  - [Other](#other)

# Setup instructions

### Starting Up

1. Copy and paste `.env.example` as `.env`
2. Run: 
   ```bash
   npm install
   ```
3. Set up the database
   ```bash
   npm run setup:db
   ```
   This will:
   - Start a PostgreSQL Docker container with environment variables
   - Run the schema migration and initialize the database schema
   - Seed the database with sample data
4. Start up NestJS:
   ```bash
   npm start
   ```
   This will start the NestJS project - access it at `localhost:3000`

### Destroy Database

In case something goes wrong and you need to start from scratch 
```bash
npm run destroy:db
```

### Generating entities if changes are done
Entities were generated using typeorm-model-generator. After any changes to the DB we can reattempt it using the following command
```bash
npm run generate:entities
```



# API documentation

## Base URL

```
http://localhost:3000
```

## Authentication

Authentication has currently not been implemented. In order to set a user in a request context we currently use either the request header or manual hardcoding.

- Add a `user-id` header to your requests with one of the test user IDs listed at [Test User IDs](#test-user-ids)
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



# Description of the data model

## ER Diagram
The data model here is extremely lean and fields were kept to the bare minimum. The relationships themselves were also made as simple as possible.

<img width="570" alt="image" src="https://github.com/user-attachments/assets/f6312d3c-22ee-4cb7-8d8a-9b9cb71840e7" />

- The patient record itself was defined as a JSONB allowing any unstructured value to be inserted.
- The user can only belong to 1 role
- The user can only belong to 1 org
- A role can have multiple permissions
- If a higher scope permission is available the granular scope is automatically granted.
- The audit log has a weak relationship with user and is used as an API request logger.
- All resources introduced in the future will have an ownerId and organizationId foreign key
- Organizations have a linear hierarchical structure supported by a numeric value (For simplicity)


### Improvements required here
- Ideally used a many to many relationship between user and organization and user and role to leave flexibility to evolve the design
- Organizational table should Ideally be a self referencing entitiy with a tree like structure
- String based permission could use a more robust field set that go along with the string based structure of the permission.


# Explanation of access control implementation

Authentication has currently not been implemented. In order to set a user in a request context we currently use either the request header or manual hardcoding. This can be easily resolved by integrating the JWT token based security guards available in NestJS.
The permission structure takes the format of. But currently we use a fake-login.interceptor to inject the user with a hardcoded ID.

```
action::scope::resource
```

Ideally these attributes are also reflected in the schema to reduce string processing burden. But they were omitted for now for simplicity.

### Controller Guards

Controller routes are safeguarded with 2 available route guards for eg:
```typescript
  @AllowPermissions(
    "delete::own::patient_record",
    "delete::any::patient_record",
  )
  @RequiredPermissions(
    "delete::own::patient_record",
    "delete::any::patient_record",
  )
```

Allow permission checks are OR'd to gether, Required are AND'd together and the final 2 results of these are AND together. We also persist an audit log of all of the interactions of the guarded routes in the DB.

### Filtering Guards

Sophisticated filtering happens at the service level. Each controller can pass down the user object to the service layer where the organization and the permissions will be available to process permission logic. 

### Where is the permission processor class?
Ideally it would have been great if we can isolate the permission processing logic concern to a separate service class. However I opted to do that now in a private method on the service to save time. Also I opted to generate the TypeORM query based on permissions available without getting all the entities into memory and then slicing it up. This will be a plus for performance but maintainability and scalability of code does take a hit.

However as we grow the codebase this permission based query generation will have to be moved to its own class. 

### How do we resolve organizational access problem
Currently since we have a linear hierarchical organizational structure with a numerical level. A user can only access organizational levels that are equal to their level or numerically higher. For example an admin at level 1 can access records at both level 1 and 2 (i.e. 1,2 >= 1 (Level 1)). An admin at level 2 can only access records that belong in level 2.

### The other scoping approach
Other than orgs, the other scoping level happens from the string. Here we currently have ANY, OWN scopes to differentiate access to resource owners. If you only have OWN permission you can only interact with records created by you at organizational levels accessible to you. If you have ANY permission you can do the action with any records within the organizations accessible to you.

| Permission | Owner | Admin | Viewer | Unprivileged |
|------------|-------|-------|--------|-------------|
| create::any::patient_record | ✓ | ✓ | | |
| read::own::patient_record | ✓ | | | |
| read::any::patient_record | | ✓ | ✓ | |
| update::own::patient_record | ✓ | | | |
| update::any::patient_record | | ✓ | | |
| delete::own::patient_record | ✓ | | | |
| delete::any::patient_record | | ✓ | | |

# Future Considerations for Data Access

## How to extended to handle more complex scenarios
- Move the data model to a many to many approach for orgs and roles and handle complex scenarios where multiple roles interact with each other resolving the key resultant permissions for a given set of roles and orgs
- Move org permission handling also to the permission table allowing different org members to access other org permissions and also add it to the permission string
- Add delegation by adding a table to maintain delegation sessions and extend the auth guard to check for delegations as well when evaluating endpoint permissions and inject the resolved delegated permissions as well. So that its decoupled from other changes.
- Add field level access granularity to the permission schema and permission string

## Security and other considerations for a production environment
- Implement proper authentication using OAuth SSO or JWT Timed Token Based authentication
- Add sophisticated Logging to all endpoint interactions and feed it to Logstash for processing and setup alarms where appropriate
- Limit Origins if possible with CORS control
- Move all DB and other passwords and critical information to a secret store
- Currently error handling is Rudimentary maintaining proper exception classes and trackable error codes with a custom exception filter will be helpful

## Performance optimizations for permission checking at scale
- Cache frequently used service outputs like getUser
- Ideally expose a role service and cache roles together with their privileges
- Move to a rich schema instead of string processing to evaluate if a permission has the necessary qualifiers
- Add db indexes where appropriate specially for organization and owner fields in any resources like records

## Other 