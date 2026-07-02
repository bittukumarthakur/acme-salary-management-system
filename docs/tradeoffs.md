# Trade-offs and Design Decisions

## Why PostgreSQL?

### Chosen

PostgreSQL (via Prisma with the `@prisma/adapter-pg` driver adapter).

### Alternatives

* SQLite
* MySQL

### Reasoning

The assessment allows a relational database of choice. PostgreSQL was chosen
for its robustness with concurrent access and larger datasets, and because it
pairs cleanly with the **Prisma Compute** deployment target, where the running
service connects to a managed Postgres instance via `DATABASE_URL`. SQLite was
considered for its zero-setup simplicity, but a server-based database better
reflects a production deployment and avoids file-based limitations once the app
is hosted. Prisma keeps the data layer portable, so the provider can be swapped
if needed.

---

## Why a Driver Adapter (`@prisma/adapter-pg`)?

### Chosen

Prisma Client configured with the `@prisma/adapter-pg` adapter and a `pg`
connection string.

### Alternative

Prisma's default built-in database connection.

### Reasoning

The driver-adapter approach keeps the connection explicit (`DATABASE_URL`) and
works well in serverless/managed runtimes like Prisma Compute. It also makes the
runtime database dependency clear and configurable per environment.

---

## Why Domain Models over ORM Types?

### Chosen

The service layer maps Prisma rows to application domain/DTO types defined in
`backend/src/models` (e.g. `Employee`, `EmployeeQuery`, `PaginatedResult<T>`)
via mappers such as `employeeMapper.ts`.

### Alternative

Expose the Prisma-generated types directly as the API contract.

### Reasoning

Mapping at the service boundary keeps ORM-only concerns (e.g. `Date` columns,
`createdAt`/`updatedAt`) out of the public shape and lets the API expose stable
formats (e.g. `joiningDate` as `YYYY-MM-DD`). It also decouples the wire contract
from the database schema, so Prisma changes don't leak into the frontend.

---

## Why Docker Compose for Local Postgres?

### Chosen

A `docker-compose.yml` runs PostgreSQL locally, with a `full` profile that also
builds and runs the backend container.

### Alternative

Require a host-installed PostgreSQL or a hosted database for local development.

### Reasoning

Compose gives every developer the same database version with one command and no
host setup, while the `full` profile allows running the whole stack in
containers. Running just `postgres` (with `yarn dev` on the host) keeps the fast
watch-mode loop for day-to-day work.

---

## Why a Self-Migrating `start`?

### Chosen

`start` runs `prisma migrate deploy` before launching the server; `postinstall`
only runs `prisma generate`.

### Alternative

Apply migrations manually (or in `postinstall`) before every run.

### Reasoning

`generate` is a pure, local code-gen step and is safe on every install; applying
migrations is a side-effecting write to a live database and belongs at
startup/deploy time, when `DATABASE_URL` is reachable. Self-migrating `start`
makes containers and Prisma Compute converge on the latest schema automatically,
while schema authoring stays an explicit `prisma migrate dev` step.

---

## Why Separate Salary History Table?

### Chosen

Dedicated Salary Revision table.

### Alternative

Updating salary records directly.

### Reasoning

Historical compensation data is important for HR operations and auditing. A separate history table preserves all changes.

---

## Why Server-Side Filtering?

### Chosen

Filtering handled by backend APIs.

### Alternative

Load all employees into frontend and filter locally.

### Reasoning

With 10,000 employees, server-side filtering scales better and reduces browser memory usage.

---

## Why Pagination?

### Chosen

Paginated employee listing.

### Alternative

Load all employees at once.

### Reasoning

Improves performance and user experience for large datasets.

---

## Why Single Repository?

### Chosen

Monorepo containing frontend and backend.

### Alternative

Separate repositories.

### Reasoning

Simplifies review, setup, deployment, and assessment evaluation.

---

## Why Gate Deployment on Tests?

### Chosen

The deploy workflow runs the test suite first and only deploys if it passes
(`needs: test`).

### Alternative

Deploy on every push to `main` without a test gate.

### Reasoning

Blocking deployment on a green test run prevents shipping a broken backend to
Prisma Compute. Coverage is reported on every run (and uploaded as an artifact),
giving fast feedback while keeping `main` deployable.

---

## Why Deploy to Prisma Compute via `@prisma/compute-cli`?

### Chosen

Build with `tsc` in CI, then deploy the pre-built `dist/` artifact using
`@prisma/compute-cli` (skip-build mode).

### Alternative

Use the `prisma/compute-deploy` GitHub Action.

### Reasoning

The official action pinned an older SDK that the live Compute API rejected, so
the CLI — which tracks the current SDK — provides a reliable, scriptable deploy
step. Pre-building keeps the build toolchain (Yarn/TypeScript) under our control
and ships only the compiled output.

---

## Why Deploy the Frontend to Cloudflare Pages?

### Chosen

Build the frontend with Vite in CI and deploy the static `dist/` to
**Cloudflare Pages** via `wrangler-action`.

### Alternative

Vercel, Netlify, or serving the built assets from the backend.

### Reasoning

The frontend is a static SPA, so a CDN-backed static host is the simplest, fast,
low-cost fit. Cloudflare Pages integrates with GitHub Actions and keeps the
frontend deploy fully independent of the backend, matching the monorepo's
separate-services model.

---

## Why Not Build Payroll Processing?

### Excluded

* Payroll runs / processing
* Payslip generation
* Tax calculations

### Reasoning

The assessment focuses on compensation management rather than payroll execution.
Payroll records **are** seeded (`yarn seed:payroll`) and read by the dashboard
for analytics (totals, deductions, net salary, recent payrolls), but there is no
payroll-run or payslip workflow. Excluding those keeps the MVP focused.

---

## Future Enhancements

* Role-based access control
* Employee self-service portal
* Payroll runs and payslip generation
* Advanced reporting
* Export to Excel and CSV
