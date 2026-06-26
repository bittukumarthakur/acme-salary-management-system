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

## Why Not Build Payroll Features?

### Excluded

* Payroll processing
* Payslips
* Tax calculations

### Reasoning

The assessment focuses on compensation management rather than payroll execution. Excluding these features keeps the MVP focused and achievable.

---

## Future Enhancements

* Role-based access control
* Employee self-service portal
* Payslip generation
* Advanced reporting
* Multi-currency conversion
* Payroll integration
* Export to Excel and CSV
