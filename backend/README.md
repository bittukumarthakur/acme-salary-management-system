# Backend — ACME Salary Management System

Express 5 + TypeScript API backed by PostgreSQL via Prisma 7. Provides the
Employee, Salary History, and Dashboard endpoints consumed by the frontend.

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Runtime  | Node.js (v18+, CI uses v22)                         |
| Server   | Express 5, TypeScript 6                             |
| ORM      | Prisma 7 (`@prisma/adapter-pg`)                     |
| Database | PostgreSQL                                          |
| Testing  | Jest, ts-jest, Supertest (coverage + JUnit reports) |

## Prerequisites

- Node.js v18+ (CI uses v22)
- Yarn
- Docker (for the local PostgreSQL database)

## Setup & Run

Follow these steps in order.

### 1. Install dependencies

```bash
cd backend
yarn install   # also runs `prisma generate` via postinstall
```

### 2. Start the database (Docker)

```bash
docker-compose up -d postgres
```

This starts PostgreSQL on port `5432` (user/password/db: `acme` / `acme` /
`acme_salary`).

### 3. Configure environment

Copy the example file and adjust as needed:

```bash
cp .env.example .env
```

The defaults match the Docker Compose database:

```bash
DATABASE_URL="postgres://acme:acme@localhost:5432/acme_salary?sslmode=disable"
PORT=8080
```

| Variable       | Required | Default | Description                  |
| -------------- | -------- | ------- | ---------------------------- |
| `DATABASE_URL` | Yes      | —       | PostgreSQL connection string |
| `PORT`         | No       | `8080`  | HTTP port the API listens on |

### 4. Apply migrations

```bash
yarn db:migrate   # prisma migrate deploy
```

> When you change the Prisma schema, create a new migration with
> `yarn prisma migrate dev` instead.

### 5. Seed data

Run the three seed scripts **in order** — master data, then employees, then payroll:

```bash
yarn seed:master     # departments, designations, salary components
yarn seed:employee   # employees + salary structures, components, bank accounts
yarn seed:payroll    # 12 months of payroll records
```

### 6. Run the app

```bash
yarn dev   # watch mode; serves http://localhost:8080
```

Other commands: `yarn build` (compile to `dist/`), `yarn start` (applies
pending migrations, then runs the compiled server), `yarn prisma studio`
(browse the database).

## Run the Full App in Docker

To run **both** the database and the backend in containers (no host Node needed):

```bash
cd backend
docker-compose --profile full up --build
```

This starts PostgreSQL, waits until it's healthy, applies pending migrations,
then runs the compiled server on `http://localhost:8080`.

## API Endpoints

Base URL: `http://localhost:8080`

| Method | Endpoint                              | Description                                        |
| ------ | ------------------------------------- | -------------------------------------------------- |
| GET    | `/health`                             | Health check (`{ "status": "ok" }`)                |
| GET    | `/api/v1/employees`                   | List employees (paginated, searchable, filterable) |
| POST   | `/api/v1/employees`                   | Create an employee                                 |
| GET    | `/api/v1/employees/:id`               | Get one employee by `id` or `employeeId`           |
| PUT    | `/api/v1/employees/:id`               | Update an employee (incl. salary revision)         |
| GET    | `/api/v1/employees/:id/salary-history`| Salary revision history (newest-first)             |
| GET    | `/api/v1/dashboard`                   | Compensation dashboard analytics                   |

### `GET /api/v1/employees` query parameters

| Param             | Type                | Default | Notes                                            |
| ----------------- | ------------------- | ------- | ------------------------------------------------ |
| `page`            | integer ≥ 1         | `1`     | Page number                                      |
| `pageSize`        | integer 1–100       | `20`    | Items per page                                   |
| `sortBy`          | enum                | `id`    | One of `id`, `name`, `joiningDate`, `employeeId` |
| `sortOrder`       | enum                | `asc`   | `asc` or `desc`                                  |
| `search`          | string              | —       | Matches name / employee ID                       |
| `country`         | string              | —       | Exact-match filter                               |
| `department`      | string              | —       | Exact-match filter                               |
| `designation`     | string              | —       | Exact-match filter                               |
| `employmentType`  | string              | —       | Exact-match filter                               |
| `status`          | string              | —       | Exact-match filter                               |
| `joiningDateFrom` | date (`YYYY-MM-DD`) | —       | Range start                                      |
| `joiningDateTo`   | date (`YYYY-MM-DD`) | —       | Range end                                        |

Invalid query parameters return `400` with an `{ "error": "..." }` message.

**Paginated response shape:**

```json
{
  "data": [ /* Employee[] */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Testing

Tests use **Jest** (with `ts-jest` and Supertest) and live under `test/`
mirroring `src/`.

```bash
yarn test            # run the suite
yarn test:watch      # watch mode
yarn test:coverage   # coverage report (HTML + lcov + summary)
yarn test:ci         # CI mode: coverage + JUnit (coverage/junit.xml)
```

Coverage reports are written to `coverage/` (git-ignored).

## Linting & Formatting

```bash
yarn lint            # eslint (src + test)
yarn lint:fix        # eslint --fix
yarn format          # prettier --write
yarn format:check    # prettier --check
```

## Project Structure

```
backend/
  lib/prisma.ts        # Prisma client (pg adapter)
  prisma/
    schema/            # Prisma schema (split by domain)
    migrations/        # SQL migrations
  scripts/             # Seed scripts (master, employee, payroll)
  src/
    app.ts             # Express app + route mounting
    main.ts            # Server entrypoint
    controllers/       # Request handlers
    routes/            # Route definitions
    services/          # Business logic + Prisma access
    models/            # Domain/DTO types
    utils/             # Query parsing, salary calc, helpers
  test/                # Jest tests (mirrors src/)
```

## More Documentation

- [Project overview](../README.md)
- [Requirements](../REQUIREMENTS.md)
- [Architecture](../docs/architecture.md)
- [Database schema](../docs/db/DATABASE_SCHEMA.md)
- [Trade-offs](../docs/tradeoffs.md)
