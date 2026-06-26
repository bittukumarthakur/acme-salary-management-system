# ACME Salary Management System — Frontend

The web UI for the ACME Salary Management System. A React + TypeScript
single-page app, built with Vite, that lets HR Managers manage employee
compensation data. It runs as a standalone service and talks to the backend
REST API.

> This README covers the **frontend (UI) only**. For backend, database, and
> overall project details, see the [root README](../README.md).

## Tech Stack

| Concern                 | Technology                             |
|-------------------------|----------------------------------------|
| Build tool / dev server | Vite                                   |
| UI framework            | React + TypeScript                     |
| Testing                 | Vitest + React Testing Library (jsdom) |
| Lint / format           | ESLint + Prettier                      |
| Package manager         | Yarn                                   |

**Planned UI libraries** (added in their feature plans as needed):
Material UI (components/theming), React Query (server state/data fetching),
React Router (routing), Recharts (dashboard charts).

## Getting Started

### Prerequisites

- Node.js (v18+; the repo uses v22)
- Yarn

### Install

```bash
yarn install
```

### Configure

The UI reads the backend API base URL from an environment variable. Copy the
example file and adjust if needed:

```bash
cp .env.example .env
```

| Variable            | Default                 | Description                      |
|---------------------|-------------------------|----------------------------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL of the backend REST API |

### Run

```bash
yarn dev
```

The app is served at **http://localhost:3000**. During development, requests to
`/api` are proxied to the backend (`http://localhost:8080`) for convenience.

## Available Scripts

| Script               | Description                                           |
|----------------------|-------------------------------------------------------|
| `yarn dev`           | Start the Vite dev server on port 3000 (HMR enabled)  |
| `yarn build`         | Type-check and produce a production bundle in `dist/` |
| `yarn preview`       | Serve the production build locally                    |
| `yarn test`          | Run the test suite once (Vitest)                      |
| `yarn test:watch`    | Run tests in watch mode                               |
| `yarn test:coverage` | Run tests with a coverage report                      |
| `yarn lint`          | Lint the codebase with ESLint                         |
| `yarn format`        | Format the codebase with Prettier                     |
| `yarn format:check`  | Check formatting without writing changes              |

## Project Structure

```
frontend/
  index.html              # App HTML entry
  vite.config.ts          # Vite + Vitest config (port 3000, /api proxy)
  eslint.config.js        # ESLint flat config (+ Prettier)
  .prettierrc             # Prettier formatting rules
  .env.example            # Documented environment variables
  src/
    main.tsx              # React entry — mounts <App/>
    App.tsx               # App shell (providers added in later plans)
    pages/                # Page components (e.g. HomePage placeholder)
    models/               # Frontend view-model/DTO types
    test/setup.ts         # Testing Library + jsdom setup
    **/*.test.tsx         # Tests live alongside the code they cover
```

## Conventions

- Keep components and modules small and focused; group related files by
  feature/domain.
- Define the app's own view-model/DTO types in `src/models` rather than leaking
  backend transport shapes throughout the UI.
- Follow Test-Driven Development (Red → Green → Refactor): write a failing test
  first, then the implementation. Every feature/change ships with tests.
- Tests live alongside the source they cover and use Vitest + React Testing
  Library.

## Testing

```bash
yarn test            # run once
yarn test:watch      # watch mode
yarn test:coverage   # with coverage
```

## Planned UI Features

- **Employee Directory** — searchable, filterable, sortable, paginated table.
- **Employee Details** — view a single employee's profile and compensation.
- **Salary Management** — view/update base salary, bonus, and allowances.
- **Salary Revision History** — audit trail of compensation changes.
- **Compensation Dashboard** — payroll totals, averages, and distribution charts.

