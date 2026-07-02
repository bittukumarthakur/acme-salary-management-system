# ACME Salary Management System

A web-based salary management system for HR teams to manage employee compensation, track salary revisions, and analyze payroll data.

## Tech Stack

| Layer    | Technology                                                      |
| -------- | --------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Material UI                         |
| Backend  | Node.js, Express 5, TypeScript                                  |
| Database | PostgreSQL via Prisma 7                                         |
| Testing  | Jest + Supertest (backend), Vitest + Testing Library (frontend) |

## Features

- **Employee Management** — List, search, filter, sort, and paginate employees.
- **Salary Management** — View and update base salary and allowances.
- **Salary Revision History** — Track salary changes with effective dates.
- **Compensation Dashboard** — Payroll totals, deductions, net salary, and recent payrolls.

## Structure

```
frontend/  → React app (Port 3000)
backend/   → Express API (Port 8080)
docs/      → Requirements, architecture, trade-offs
```

## Getting Started

The app runs as two services. Set up the backend first, then the frontend.

1. **Backend** (Port 8080) — see [backend/README.md](backend/README.md) for setup, seeding, Docker, and API details.
2. **Frontend** (Port 3000) — see [frontend/README.md](frontend/README.md) for setup and configuration.

## Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Requirements](REQUIREMENTS.md)
- [Architecture](docs/architecture.md)
- [Trade-offs](docs/tradeoffs.md)
