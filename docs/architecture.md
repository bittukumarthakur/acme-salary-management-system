# Architecture

The system is a monorepo with two independent services: a **React frontend** and
an **Express backend**, backed by **PostgreSQL** via Prisma.

## High-Level Architecture

```mermaid
flowchart LR
    User(("User")) --> FE

    subgraph Monorepo["Monorepo"]
        FE["Frontend<br/>React + Vite<br/>Port 3000"]
        BE["Backend<br/>Express + TypeScript<br/>Port 8080"]
    end

    FE -->|"REST /api/v1"| BE
    BE --> PRISMA["Prisma ORM<br/>(@prisma/adapter-pg)"]
    PRISMA --> DB[("PostgreSQL")]
```

Frontend and backend run as separate services on separate ports. The frontend
calls the backend over REST under `/api/v1`; the backend reads/writes PostgreSQL
through Prisma.

## Backend

Layered Express app: **routes → controllers → services → Prisma**. Services map
Prisma rows to domain models (`src/models`) so ORM types never leak into the API.

```mermaid
flowchart TB
    subgraph backend["backend/src"]
        routes["routes/<br/>employees · dashboard"]
        controllers["controllers/<br/>employeesController"]
        services["services/<br/>employeesService<br/>updateEmployeeService<br/>salaryHistoryService<br/>salaryComponentsSync<br/>dashboardService<br/>employeeMapper · errors"]
        models["models/<br/>domain DTOs"]
        utils["utils/<br/>query parsing · salary calc"]
    end

    routes --> controllers --> services
    services --> models
    services --> utils
    services --> prisma[("Prisma / PostgreSQL")]
```

- **routes/** — endpoint definitions mounted under `/api/v1`.
- **controllers/** — request/response handling and validation entry points.
- **services/** — business logic and all Prisma access.
- **models/** — application domain/DTO types.
- **utils/** — query-param parsing and salary calculations.

Schema and migrations live under `backend/prisma/`; the DB connection comes from
`DATABASE_URL`.

## Frontend

Feature-based structure. Each feature owns its pages/components; cross-cutting
code lives in `shared/`.

```mermaid
flowchart TB
    subgraph frontend["frontend/src"]
        features["features/<br/>dashboard · employees · view-employees<br/>add-employee · edit-employees"]
        shared["shared/<br/>api · components · constants · utils"]
    end

    features --> shared
    shared -->|"api client"| backend[("Backend REST API")]
```

- **features/** — self-contained feature slices (pages + components + hooks).
- **shared/** — API client, reusable components, constants, and helpers.

## API Endpoints

| Method | Endpoint                               | Description                     |
| ------ | -------------------------------------- | ------------------------------- |
| GET    | `/api/v1/employees`                    | List (paginated/filter/sort)    |
| POST   | `/api/v1/employees`                    | Create an employee              |
| GET    | `/api/v1/employees/:id`                | Get one employee                |
| PUT    | `/api/v1/employees/:id`                | Update (incl. salary revision)  |
| GET    | `/api/v1/employees/:id/salary-history` | Salary revision history         |
| GET    | `/api/v1/dashboard`                    | Compensation dashboard analytics|

## Testing

- **Backend** — Jest + ts-jest (unit) and Supertest (API integration); typed
  fixtures under `test/data/`.
- **Frontend** — Vitest + React Testing Library (jsdom).

## CI/CD & Deployment

GitHub Actions in `.github/workflows/` deploy each service independently from
`main`. Every workflow runs a `test` job first and only deploys if it passes.

- **`deploy-backend.yml`** — on push to `main` touching `backend/**`. Runs
  `yarn test:ci`, builds with `tsc`, and deploys the compiled `dist/` artifact
  to **Prisma Compute** via `@prisma/compute-cli`.
- **`deploy-frontend.yml`** — on push to `main` touching `frontend/**`. Runs
  `yarn test:coverage`, builds with Vite, and deploys `dist/` to
  **Cloudflare Pages** via `wrangler-action`.

```mermaid
flowchart LR
    push["Push to main"] --> beTest["backend test<br/>yarn test:ci"]
    push --> feTest["frontend test<br/>yarn test:coverage"]
    beTest -->|green| beDeploy["deploy<br/>@prisma/compute-cli"]
    feTest -->|green| feDeploy["deploy<br/>Cloudflare Pages"]
    beDeploy --> compute[("Prisma Compute")]
    feDeploy --> pages[("Cloudflare Pages")]
```

Deployment config is supplied via the GitHub `dev` environment:

| Service  | Secrets                                       | Variables                                                        |
| -------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Backend  | `PRISMA_API_TOKEN`, `DATABASE_URL`            | `BACKEND_COMPUTE_SERVICE_ID`, `BACKEND_PORT`                     |
| Frontend | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `CLOUDFLARE_PAGES_PROJECT`, `VITE_API_BASE_URL`                |
