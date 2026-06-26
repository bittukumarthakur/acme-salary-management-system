# ACME Salary Management System

A web-based salary management system for HR teams to manage employee compensation, track salary revisions, and analyze payroll data for 10,000 employees.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Material UI, React Query, Recharts *(planned)* |
| Backend | Node.js, Express 5, TypeScript 6 |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Database | PostgreSQL |
| Testing | Jest, ts-jest, Supertest (coverage + JUnit reports) |
| CI/CD | GitHub Actions → Prisma Compute |

> **Status:** The backend (Employee API, Prisma/PostgreSQL, tests, and deployment pipeline) is implemented. The frontend and the Salary / Dashboard APIs are part of the planned product scope.

## Features

- **Employee Management** — List, search, filter, sort, and paginate employees by country, department, designation, employment type, status, and joining-date range. *(implemented)*
- **Salary Management** — View and update compensation details including base salary, bonus, and allowances. *(planned)*
- **Salary Revision History** — Track all salary changes with previous/new values, reasons, and effective dates. *(planned)*
- **Compensation Dashboard** — Analytics including total payroll cost, average salary, distribution by country/department, and recent revisions. *(planned)*

## Architecture

Frontend and backend run as separate services on separate ports within a single monorepo.

```
frontend/  → React app (Port 3000) — planned
backend/   → Express API (Port 8000)
docs/      → Requirements, architecture, trade-offs
.github/   → CI/CD workflows (tests + Prisma Compute deploy)
```

## Getting Started

### Prerequisites

- Node.js (v18+, CI uses v22)
- Yarn
- PostgreSQL database (local instance or a hosted Postgres connection string)

### Setup

```bash
# Install backend dependencies
cd backend
yarn install

# Configure environment
# Create backend/.env with your PostgreSQL connection string:
#   DATABASE_URL="postgresql://user:password@localhost:5432/acme"
#   PORT=8000

# Apply database migrations and generate the Prisma client
yarn prisma migrate deploy   # or: yarn prisma migrate dev
yarn prisma generate
```

> `prisma generate` also runs automatically via the `postinstall` script.

### Run

```bash
# Start backend (Port 8000)
cd backend
yarn dev
```

### Seed Data

Seeds 10,000 employee records (in batches) into the configured PostgreSQL database:

```bash
yarn seed
```

### Prisma Studio

```bash
yarn prisma studio
```

## API Endpoints

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (`{ "status": "ok" }`) |
| GET | `/api/employees` | List employees (paginated, searchable, filterable, sortable) |
| GET | `/api/employees/:id` | Get a single employee by `id` or `employeeId` |

### `GET /api/employees` query parameters

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | integer ≥ 1 | `1` | Page number |
| `pageSize` | integer 1–100 | `20` | Items per page |
| `sortBy` | enum | `id` | One of `id`, `name`, `joiningDate`, `employeeId` |
| `sortOrder` | enum | `asc` | `asc` or `desc` |
| `search` | string | — | Matches name / employee ID |
| `country` | string | — | Exact-match filter |
| `department` | string | — | Exact-match filter |
| `designation` | string | — | Exact-match filter |
| `employmentType` | string | — | Exact-match filter |
| `status` | string | — | Exact-match filter |
| `joiningDateFrom` | date (`YYYY-MM-DD`) | — | Range start |
| `joiningDateTo` | date (`YYYY-MM-DD`) | — | Range end |

Invalid query parameters return `400` with an `{ "error": "..." }` message.

**Paginated response shape:**

```json
{
  "data": [ /* Employee[] */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 10000,
    "totalPages": 500,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Testing

The backend uses **Jest** (with `ts-jest` and Supertest). Tests live under `backend/test/` mirroring `src/`.

```bash
cd backend
yarn test            # run the suite
yarn test:watch      # watch mode
yarn test:coverage   # run with coverage report (HTML + lcov + summary)
yarn test:ci         # CI mode: coverage + JUnit report (coverage/junit.xml)
```

Coverage reports are written to `backend/coverage/` (git-ignored).

## Deployment & CI/CD

GitHub Actions workflows live in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `tests-backend.yml` | push / PR touching `backend/**` | Run tests with coverage and publish a coverage summary |
| `deploy-backend.yml` | push to `main` touching `backend/**`, or manual dispatch | Run tests, then deploy to **Prisma Compute** if they pass |

The deploy job is **gated on a passing test job** (`needs: test`) and uses the [`@prisma/compute-cli`](https://www.npmjs.com/package/@prisma/compute-cli) to deploy a pre-built artifact.

**Required GitHub configuration (under the `dev` environment):**

| Type | Name | Description |
|------|------|-------------|
| Secret | `PRISMA_API_TOKEN` | Prisma API service token |
| Secret | `DATABASE_URL` | Runtime PostgreSQL connection string |
| Variable | `COMPUTE_SERVICE_ID` | Target Prisma Compute service ID |
| Variable | `PORT` | HTTP port the service listens on |

## Documentation

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Trade-offs](docs/tradeoffs.md)
