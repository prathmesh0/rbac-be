# Production-Grade Dynamic RBAC Backend

A scalable, production-oriented **Role-Based Access Control (RBAC)** backend built with Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Zod, and a modular architecture.

The system provides dynamic management of:

- Users
- Roles
- Modules
- Actions
- Permissions

Instead of hard-coding roles and permissions in the application, the authorization system is designed to be **database-driven and dynamic**.

---

## 🚀 Features

### Authentication

- User registration
- Secure login
- Password hashing using bcrypt
- JWT authentication
- Access tokens
- Refresh tokens
- Refresh token rotation
- Secure authentication cookies
- Protected routes
- Current user session endpoint

### User Management

- Create users
- View users
- Update users
- Activate/deactivate users
- Delete users
- Assign one or multiple roles

### Dynamic Action Management

Create and manage custom actions dynamically.

Examples:

```text
CREATE
READ
UPDATE
DELETE
EXPORT
APPROVE
REJECT
ASSIGN
DOWNLOAD
```

Actions are not limited to CRUD operations.

---

### Dynamic Module Management

Create application modules dynamically.

Examples:

```text
DASHBOARD
ANALYTICS
VEHICLE
USER
ROLE
PERMISSION
SETTINGS
```

Modules can also store metadata required by frontend applications, such as:

- Navigation path
- Icon
- Display order
- Parent module
- Active status

---

### Role Management

Create and manage roles dynamically.

Examples:

```text
SUPER_ADMIN
ADMIN
MANAGER
OPERATOR
VIEWER
```

The system supports assigning multiple roles to a user.

---

### Permission Management

Permissions are assigned using the following structure:

```text
ROLE
  ↓
MODULE
  ↓
ACTIONS
```

Example:

```text
ADMIN

├── DASHBOARD
│   └── READ
│
├── ANALYTICS
│   └── READ
│
└── VEHICLE
    ├── CREATE
    ├── READ
    └── UPDATE
```

---

## 🏗 Architecture

The project follows a **feature-based modular architecture**.

```text
src/
│
├── config/
├── constants/
├── middlewares/
├── modules/
├── shared/
│
├── app.ts
└── server.ts
```

Each business module contains its own:

```text
controller
service
repository
model
routes
validation
types
```

Example:

```text
modules/
└── roles/
    ├── role.model.ts
    ├── role.controller.ts
    ├── role.service.ts
    ├── role.repository.ts
    ├── role.routes.ts
    ├── role.validation.ts
    └── role.types.ts
```

This architecture keeps related business logic together and makes the system easier to scale.

---

# 🧩 RBAC Architecture

The authorization system follows this relationship:

```text
USER
 │
 │ has multiple
 ▼
ROLES
 │
 │ have
 ▼
PERMISSIONS
 │
 ├──────────────► MODULE
 │
 └──────────────► ACTIONS
```

A permission document represents:

```text
ONE ROLE
+
ONE MODULE
+
MULTIPLE ACTIONS
```

Example:

```json
{
  "roleId": "ADMIN_ROLE_ID",
  "moduleId": "VEHICLE_MODULE_ID",
  "actionIds": ["CREATE_ACTION_ID", "READ_ACTION_ID", "UPDATE_ACTION_ID"]
}
```

---

# 🔐 Authorization Flow

Every protected request follows this flow:

```text
Client Request
      ↓
Authentication Middleware
      ↓
Identify User
      ↓
Get User Roles
      ↓
Authorization Middleware
      ↓
Check Module Permission
      ↓
Check Action Permission
      ↓
Allow / Deny Request
```

Example:

```ts
router.post(
  "/vehicles",
  authenticate,
  authorize("VEHICLE", "CREATE"),
  createVehicle,
);
```

The authorization middleware dynamically checks whether the authenticated user has permission for:

```text
Module: VEHICLE

Action: CREATE
```

---

# 🗂 Database Models

The core RBAC system contains the following collections:

```text
User
Role
Action
Module
Permission
```

## User

```text
User
├── name
├── email
├── password
├── roles[]
├── isActive
└── timestamps
```

---

## Role

```text
Role
├── name
├── code
├── description
├── isSystemRole
├── isActive
└── timestamps
```

Example:

```text
ADMIN
MANAGER
VIEWER
```

---

## Action

```text
Action
├── name
├── code
├── description
├── isActive
└── timestamps
```

Examples:

```text
CREATE
READ
UPDATE
DELETE
EXPORT
APPROVE
```

---

## Module

```text
Module
├── name
├── code
├── description
├── path
├── icon
├── parentModuleId
├── order
├── isActive
└── timestamps
```

Examples:

```text
DASHBOARD
ANALYTICS
VEHICLE
USER
ROLE
```

---

## Permission

```text
Permission
├── roleId
├── moduleId
├── actionIds[]
└── timestamps
```

---

# 📡 API Structure

```text
/api/v1
│
├── auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   ├── POST /logout
│   └── GET  /me
│
├── users
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PATCH /:id
│   ├── DELETE /:id
│   └── PATCH /:id/roles
│
├── actions
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PATCH /:id
│   └── DELETE /:id
│
├── modules
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PATCH /:id
│   └── DELETE /:id
│
├── roles
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PATCH /:id
│   └── DELETE /:id
│
└── permissions
    ├── POST /
    ├── GET /
    ├── GET /role/:roleId
    ├── PATCH /:id
    └── DELETE /:id
```

---

# 🛣 Development Roadmap

## Phase 0 — Project Foundation

- [ ] Express application setup
- [ ] TypeScript configuration
- [ ] Environment validation
- [ ] MongoDB connection
- [ ] Global error handling
- [ ] API response structure
- [ ] Async error handling
- [ ] Health check endpoint
- [ ] Base routing structure

Branch:

```text
feature/project-foundation
```

---

## Phase 1 — Authentication

- [ ] Super Admin bootstrap
- [ ] User registration
- [ ] Login
- [ ] Password hashing
- [ ] Access token
- [ ] Refresh token
- [ ] Refresh token rotation
- [ ] Logout
- [ ] Protected routes

Branch:

```text
feature/authentication
```

---

## Phase 2 — Action Management

- [ ] Create actions
- [ ] Get actions
- [ ] Update actions
- [ ] Deactivate actions
- [ ] Delete actions
- [ ] Prevent deletion of actions used by permissions

Branch:

```text
feature/action-management
```

---

## Phase 3 — Module Management

- [ ] Create modules
- [ ] Get modules
- [ ] Update modules
- [ ] Nested modules
- [ ] Navigation metadata
- [ ] Activate/deactivate modules

Branch:

```text
feature/module-management
```

---

## Phase 4 — Role Management

- [ ] Create roles
- [ ] Get roles
- [ ] Update roles
- [ ] Activate/deactivate roles
- [ ] Protect system roles

Branch:

```text
feature/role-management
```

---

## Phase 5 — User Management

- [ ] Create users
- [ ] Get users
- [ ] Update users
- [ ] Activate/deactivate users
- [ ] Assign multiple roles
- [ ] Remove roles

Branch:

```text
feature/user-management
```

---

## Phase 6 — Permission Management

- [ ] Assign module permissions
- [ ] Assign actions to modules
- [ ] Assign permissions to roles
- [ ] Update permissions
- [ ] Remove permissions
- [ ] Get permissions by role

Branch:

```text
feature/permission-management
```

---

## Phase 7 — Dynamic Authorization

- [ ] Authentication middleware
- [ ] Dynamic authorization middleware
- [ ] Module-based permission checks
- [ ] Action-based permission checks
- [ ] Multi-role permission merging

Branch:

```text
feature/rbac-authorization
```

---

## Phase 8 — Permission-Aware User Session

- [ ] Current user endpoint
- [ ] User roles
- [ ] Aggregated permissions
- [ ] Frontend-friendly permission response

Branch:

```text
feature/user-permission-session
```

---

## Phase 9 — Advanced Authorization

- [ ] Resource ownership
- [ ] Conditional permissions
- [ ] Explicit deny rules
- [ ] Advanced multi-role strategies

Branch:

```text
feature/advanced-authorization
```

---

## Phase 10 — Performance

- [ ] Permission caching
- [ ] Redis integration
- [ ] Cache invalidation
- [ ] Optimized authorization queries

Branch:

```text
feature/permission-caching
```

---

## Phase 11 — Audit Logging

- [ ] Track role changes
- [ ] Track permission changes
- [ ] Track user role assignments
- [ ] Store actor information
- [ ] Store old and new values

Branch:

```text
feature/audit-logs
```

---

## Phase 12 — Security

- [ ] Rate limiting
- [ ] Secure headers
- [ ] CORS configuration
- [ ] Cookie security
- [ ] Input validation
- [ ] MongoDB injection protection
- [ ] Request size limits
- [ ] Account security

Branch:

```text
feature/security-hardening
```

---

## Phase 13 — Testing

- [ ] Unit tests
- [ ] Service tests
- [ ] Repository tests
- [ ] Integration tests
- [ ] Authentication tests
- [ ] Authorization tests

Branch:

```text
feature/testing
```

---

## Phase 14 — Production Deployment

- [ ] Docker
- [ ] Docker Compose
- [ ] Health checks
- [ ] Graceful shutdown
- [ ] CI/CD
- [ ] GitHub Actions
- [ ] Environment configuration
- [ ] Production deployment

Branch:

```text
feature/production-deployment
```

---

# 🛠 Tech Stack

```text
Runtime
Node.js

Framework
Express

Language
TypeScript

Database
MongoDB

ODM
Mongoose

Validation
Zod

Authentication
JWT

Password Hashing
bcrypt

Caching
Redis (planned)

Containerization
Docker

CI/CD
GitHub Actions
```

---

# 🌳 Git Workflow

Every development phase should be developed in a separate branch.

Example:

```bash
git checkout main
git pull origin main

git checkout -b feature/action-management
```

After implementation:

```bash
git add .

git commit -m "feat: implement action management"

git push origin feature/action-management
```

After testing and review:

```text
feature/action-management
        ↓
       merge
        ↓
       main
```

Then start the next phase from the updated main branch.

---

# 🎯 Project Goal

The goal of this project is to build a reusable, scalable, and production-oriented authorization system where permissions are completely dynamic.

The system should support future requirements such as:

```text
New Modules
New Actions
New Roles
Multiple Roles per User
Dynamic Permissions
Frontend Navigation Permissions
Button-Level Permissions
Ownership-Based Authorization
Permission Caching
Audit Logging
```

The final authorization decision should always follow:

```text
USER
 ↓
ROLES
 ↓
PERMISSIONS
 ↓
MODULE
 ↓
ACTION
 ↓
ALLOW / DENY



/api/v1
│
├── auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   ├── POST /logout
│   └── GET  /me
│
├── users
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PATCH /:id
│   ├── DELETE /:id
│   └── PATCH /:id/roles
│
├── actions
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PATCH /:id
│   └── DELETE /:id
│
├── modules
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PATCH /:id
│   └── DELETE /:id
│
├── roles
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PATCH /:id
│   └── DELETE /:id
│
└── permissions
    ├── POST /
    ├── GET /
    ├── GET /role/:roleId
    ├── PATCH /:id
    └── DELETE /:id
```
