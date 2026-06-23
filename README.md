# ACME Salary Management System

A web-based salary management system for HR teams to manage employee compensation, track salary revisions, and analyze payroll data for 10,000 employees.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Material UI, React Query, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | SQLite |

## Features

- **Employee Management** — View, search, and filter employees by country, department, designation, and employment type.
- **Salary Management** — View and update compensation details including base salary, bonus, and allowances.
- **Salary Revision History** — Track all salary changes with previous/new values, reasons, and effective dates.
- **Compensation Dashboard** — Analytics including total payroll cost, average salary, distribution by country/department, and recent revisions.

## Architecture

Frontend and backend run as separate services on separate ports within a single monorepo.

```
frontend/  → React app (Port 8000)
backend/   → Express API (Port 3000)
docs/      → Requirements, architecture, trade-offs
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Setup

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Run

```bash
# Start backend (Port 3000)
cd backend
npm run dev

# Start frontend (Port 8000)
cd frontend
npm run dev
```

## Documentation

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Trade-offs](docs/tradeoffs.md)
