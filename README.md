# rbac-be

Production-grade, database-driven **Role-Based Access Control** REST API. Roles, modules, and actions are managed at runtime — nothing is hard-coded in the source.

Built with Node.js, Express 5, TypeScript, MongoDB/Mongoose, JWT, and Zod.

## Features

- **Auth** — register, login, logout, refresh-token rotation, `GET /me`, bcrypt hashing, httpOnly refresh cookie
- **Users** — full CRUD, activate/deactivate, multi-role assignment
- **Roles** — CRUD with system-role protection
- **Modules** — CRUD, nested modules via `parentModuleId`, frontend nav metadata (`path`, `icon`, `order`), tree endpoint
- **Actions** — CRUD, not limited to CRUD verbs (e.g. `EXPORT`, `APPROVE`)
- **Permissions** — one document per `roleId + moduleId`, holding a set of `actionIds`
- **Platform** — Zod validation on every route, `helmet`, CORS, request logging, 10 kB body cap, global error handler, Zod-validated env, idempotent seeder

## Tech Stack

| Layer     | Technology                  |
| --------- | --------------------------- |
| Runtime   | Node.js 20+                 |
| Framework | Express 5                   |
| Language  | TypeScript (ESM, strict)    |
| Database  | MongoDB + Mongoose          |
| Auth      | `jsonwebtoken`, `bcrypt`     |
| Validation| Zod                         |
| Security  | `helmet`, `cors`            |
| Tooling   | `tsx`, `prettier`, `eslint` |

## Getting Started

### Prerequisites

- Node.js >= 20
- A MongoDB instance (local or Atlas)

### 1. Install

```bash
git clone https://github.com/prathmesh0/rbac-be.git
cd rbac-be
npm install
```

### 2. Configure

Create a `.env` file in the project root:

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rbac

JWT_ACCESS_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<another-long-random-string>
JWT_ACCESS_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

FRONTEND_URL=http://localhost:5173

# Seeding (super admin)
SEED_SUPER_ADMIN_NAME=Super Admin
SEED_SUPER_ADMIN_EMAIL=superadmin@example.com
SEED_SUPER_ADMIN_PASSWORD=ChangeMe@12345
SEED_DEMO_PASSWORD=Password@123
```

| Variable                    | Required | Default                 | Notes                                            |
| --------------------------- | -------- | ----------------------- | ------------------------------------------------ |
| `NODE_ENV`                  | no       | `development`           | `development` \| `production` \| `test`          |
| `PORT`                      | no       | `5000`                  |                                                  |
| `MONGODB_URI`               | **yes**  | —                       | Connection string                                |
| `FRONTEND_URL`              | **yes**  | —                       | Allowed CORS origin                              |
| `JWT_ACCESS_SECRET`         | **yes**  | —                       | Access token signing secret                      |
| `JWT_REFRESH_SECRET`        | **yes**  | —                       | Refresh token signing secret                     |
| `JWT_ACCESS_EXPIRES_IN`     | no       | `900` (15 min)          | Seconds                                          |
| `JWT_REFRESH_EXPIRES_IN`    | no       | `604800` (7 days)       | Seconds                                          |
| `SEED_SUPER_ADMIN_NAME`     | no       | `Super Admin`           |                                                  |
| `SEED_SUPER_ADMIN_EMAIL`    | no       | `superadmin@example.com`|                                                  |
| `SEED_SUPER_ADMIN_PASSWORD` | prod only| `SuperAdmin@123` (dev)  | Required in production; demo password is rejected |
| `SEED_DEMO_PASSWORD`        | no       | `Password@123`          | Password for seeded demo users                   |
| `SEED_DEMO_USERS`           | no       | `false`                 | Set `true` to seed demo users in production      |

The app fails fast on invalid or missing environment variables.

### 3. Seed

```bash
npm run seed
```

Idempotent — safe to re-run. Creates actions, modules (with parents), roles, permissions, a super admin, and (outside production) demo users `admin@example.com`, `manager@example.com`, and `viewer@example.com`.

`SUPER_ADMIN` holds no permission rows: its access is computed as *all active modules × all active actions*.

### 4. Run

```bash
npm run dev     # watch mode (tsx)
npm run build   # compile to dist/
npm start       # run compiled build
```

Verify:

```bash
curl http://localhost:5000/api/v1/health
```

## API

Base URL: `http://localhost:5000/api/v1`

| Method   | Path                    | Auth | Description                          |
| -------- | ----------------------- | ---- | ------------------------------------ |
| `GET`    | `/health`               | –    | Health check                         |
| `POST`   | `/auth/register`        | –    | Create account                       |
| `POST`   | `/auth/login`           | –    | Login                                |
| `POST`   | `/auth/refresh`         | Cookie | Issue a new access token           |
| `POST`   | `/auth/logout`          | ✔    | Logout                               |
| `GET`    | `/auth/me`              | ✔    | Current user with roles/permissions  |
| `POST`   | `/users`                | ✔    | Create user                          |
| `GET`    | `/users`                | ✔    | List users                           |
| `GET`    | `/users/:id`            | ✔    | Get user                             |
| `PATCH`  | `/users/:id`            | ✔    | Update user                          |
| `PATCH`  | `/users/:id/status`     | ✔    | Activate / deactivate                |
| `PATCH`  | `/users/:id/roles`      | ✔    | Assign roles                         |
| `DELETE` | `/users/:id`            | ✔    | Delete user                          |
| `POST`   | `/roles`                | ✔    | Create role                          |
| `GET`    | `/roles`                | ✔    | List roles                           |
| `GET`    | `/roles/:id`            | ✔    | Get role                             |
| `PATCH`  | `/roles/:id`            | ✔    | Update role                          |
| `PATCH`  | `/roles/:id/status`     | ✔    | Activate / deactivate                |
| `DELETE` | `/roles/:id`            | ✔    | Delete role                          |
| `POST`   | `/modules`              | ✔    | Create module                        |
| `GET`    | `/modules`              | ✔    | List modules                         |
| `GET`    | `/modules/tree`         | ✔    | Nested module tree                   |
| `GET`    | `/modules/:id`          | ✔    | Get module                           |
| `PATCH`  | `/modules/:id`          | ✔    | Update module                        |
| `PATCH`  | `/modules/:id/status`   | ✔    | Activate / deactivate                |
| `DELETE` | `/modules/:id`          | ✔    | Delete module                        |
| `POST`   | `/actions`              | ✔    | Create action                        |
| `GET`    | `/actions`              | ✔    | List actions                         |
| `GET`    | `/actions/:id`          | ✔    | Get action                           |
| `PATCH`  | `/actions/:id/status`   | ✔    | Activate / deactivate                |
| `DELETE` | `/actions/:id`          | ✔    | Delete action                        |
| `POST`   | `/permissions`          | ✔    | Grant role → module → actions        |
| `GET`    | `/permissions`          | ✔    | List permissions                     |
| `GET`    | `/permissions/role/:roleId` | ✔ | Permissions for a role             |
| `PATCH`  | `/permissions/:id`      | ✔    | Update actions on a permission       |
| `DELETE` | `/permissions/:id`      | ✔    | Revoke permission                    |

### Authentication

Send the access token as a bearer token:

```http
Authorization: Bearer <accessToken>
```

The refresh token is set as an httpOnly cookie scoped to `/api/v1/auth` and is rotated on every `/auth/refresh`.

### Response format

Success:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": { "user": {}, "accessToken": "..." }
}
```

Error:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "path": ["email"], "message": "Invalid email" }]
}
```

`stack` is included in responses only when `NODE_ENV=development`.

## Data Model

```
User ──has many──► Role ──has many──► Permission ──► Module
                                              └────► Action[]
```

A `Permission` document represents one role, one module, and many actions:

```json
{
  "roleId": "...",
  "moduleId": "...",
  "actionIds": ["...", "..."]
}
```

Permissions from all of a user's roles are merged. `isActive` disables a record without deleting it, so it stays valid for existing references.

## Project Structure

```
src/
├── config/        # env validation, database connection
├── constants/     # RBAC constants
├── middlewares/   # auth, validation, 404, error handling
├── modules/       # feature-based: auth, users, roles, modules, actions, permissions
│   └── <feature>/ # model · controller · service · repository · routes · validation · types
├── seeds/         # idempotent seed data + runner
├── types/         # ambient Express types
├── utils/         # ApiError, ApiResponse, asyncHandler, jwt, password
├── app.ts         # express app assembly
└── server.ts      # bootstrap
```

Each feature owns its full vertical slice, so changes stay local and modules can be lifted out independently.

## Scripts

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start dev server with watch reload |
| `npm run build` | Type-check and compile to `dist/`  |
| `npm start`     | Run the compiled server            |
| `npm run seed`  | Seed baseline RBAC data            |

## Notes

- Use a dedicated MongoDB database for each environment.
- Rotate `JWT_*_SECRET` in production and source secrets from your platform's secret manager, never from a committed file.
- `DELETE` endpoints are hard deletes; guard against dangling references before removing a module, action, or role that permissions still point to.

## License

ISC — see [package.json](package.json).
