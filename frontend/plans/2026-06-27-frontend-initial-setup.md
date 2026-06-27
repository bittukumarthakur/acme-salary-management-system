# Frontend Initial Project Setup (Vite + React + TypeScript)

- **Date**: 2026-06-27
- **Status**: completed

## Summary

Scaffold the `frontend/` service as a React + TypeScript single-page app built
with Vite, running as a separate service on **port 3000** and talking to the
existing backend (Express API on port 8080) over REST. This first plan focuses
only on the **project setup and tooling foundation** — not on building feature
screens yet. It establishes the build/dev tooling, testing setup, and
linting/formatting, plus a verifiable "hello world" app shell so subsequent
feature plans (employee directory, salary management, dashboard) can build on top.

> **Library policy for this plan:** only the libraries strictly needed for the
> setup are installed now (React, Vite, TypeScript, and the testing/lint
> tooling). The agreed feature libraries — **Material UI, React Query, Recharts,
> React Router, and the API client (axios/fetch)** — are documented here as part
> of the planned stack but are **deferred** and will be installed in the feature
> plans that first need them.

Per the architecture docs, the frontend and backend remain in a single monorepo
but run independently; the frontend is deployable separately (suggested: Vercel).

## Goals / Scope

- Working Vite + React + TypeScript dev server on port 3000.
- Yarn as the package manager (matching the repo convention).
- Testing foundation (Vitest + React Testing Library) following the repo's TDD
  rules, with a first passing component test.
- Linting + formatting (ESLint + Prettier) consistent with backend conventions.
- Environment-based backend API base URL (`VITE_API_BASE_URL`, default
  `http://localhost:8080`).
- A minimal app shell rendering a placeholder page — proof the stack is wired
  correctly (plain React for now; MUI theming added in a later plan).
- `.gitignore` for `node_modules/`, `dist/`, coverage output.

> **Install now (setup only):** React, ReactDOM, Vite, TypeScript, the Vite
> React plugin, and the testing/lint tooling (Vitest, React Testing Library,
> jest-dom, jsdom, ESLint, Prettier).
>
> **Deferred (documented, installed later in feature plans):** Material UI,
> React Query, Recharts, React Router, and the API client (axios/fetch).

> Out of scope for this plan: employee list/table, filters, salary screens,
> dashboard charts, and API data wiring. Those get their own plans.

## Tech Stack (from docs/architecture.md)

| Concern                      | Choice                                 | When installed            |
| ---------------------------- | -------------------------------------- | ------------------------- |
| Build tool / dev server      | Vite                                   | **This plan**             |
| UI framework                 | React + TypeScript                     | **This plan**             |
| Testing                      | Vitest + React Testing Library + jsdom | **This plan**             |
| Lint / format                | ESLint + Prettier                      | **This plan**             |
| Package manager              | Yarn                                   | **This plan**             |
| Component library            | Material UI (MUI)                      | Deferred — feature plan   |
| Server state / data fetching | React Query (`@tanstack/react-query`)  | Deferred — feature plan   |
| Charts (dashboard, later)    | Recharts                               | Deferred — dashboard plan |
| Routing                      | React Router                           | Deferred — feature plan   |
| API client                   | axios / native `fetch`                 | Deferred — feature plan   |

## Proposed Structure

```
frontend/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  .env                      # VITE_API_BASE_URL (git-ignored, example committed)
  .env.example
  .eslintrc / eslint.config.js
  .prettierrc
  .gitignore
  plans/
  src/
    main.tsx                # entry: mounts <App/>
    App.tsx                 # app shell: renders placeholder page (providers added later)
    pages/                  # page components (placeholder landing page)
    models/                 # frontend view-model/DTO types (added as needed)
    test/
      setup.ts              # RTL/jsdom + jest-dom setup
    # Added in later feature plans (not this setup plan):
    #   providers/          # QueryClientProvider, ThemeProvider wrappers
    #   theme/              # MUI theme config
    #   routes/             # React Router route definitions
    #   api/client.ts       # API client (axios/fetch) reading VITE_API_BASE_URL
  test/ or src/**.test.tsx  # mirrors source structure
```

Follows the frontend refactoring conventions: small focused modules grouped by
feature/domain, and the app defines its **own** view-model/DTO types rather than
leaking backend transport shapes throughout the UI (mirroring the backend
domain-model boundary).

## Steps

1. Scaffold the app with Vite's React + TypeScript template inside `frontend/`
   (e.g. `yarn create vite . --template react-ts`), using Yarn.
2. Configure `vite.config.ts` to run the dev server on **port 3000** and proxy
   (optional) `/api` to `http://localhost:8080` for local dev convenience.
3. Add environment config: `.env.example` with
   `VITE_API_BASE_URL=http://localhost:8080`; git-ignore the real `.env`.
4. Create a minimal app shell (plain React, no extra libraries yet):
   - `pages/` with a single placeholder landing page
   - `App.tsx` rendering the placeholder page; `main.tsx` mounting it
   - Leave clear extension points/comments for where the deferred providers
     (MUI `ThemeProvider`, React Query `QueryClientProvider`, Router) will be
     added in later feature plans.
5. Set up testing (TDD-ready): install `vitest`, `@testing-library/react`,
   `@testing-library/jest-dom`, `jsdom`; add `src/test/setup.ts`; configure
   Vitest in `vite.config.ts`; add `test`, `test:watch`, `test:coverage` scripts.
6. Set up ESLint + Prettier consistent with the backend's formatting rules; add
   `lint`, `format`, `format:check` scripts.
7. Add `.gitignore` (`node_modules/`, `dist/`, coverage).
8. Add npm scripts: `dev`, `build`, `preview`, `test`, `lint`, `format`.
9. Update root `README.md` frontend section once setup is verified (mark
   frontend setup as in progress / available; document `yarn dev` on port 3000).

> The feature libraries (Material UI, React Query, Recharts, React Router, and
> the API client) are intentionally **not** installed in this plan. Each will be
> added — with `yarn add` — in the feature plan that first requires it, so the
> setup stays minimal.

## TDD Note (per repo Common Instructions)

Even though this is mostly scaffolding, the first piece of real UI (the app
shell / placeholder page) follows Red-Green-Refactor:

1. **Red** — write a failing test that renders `<App/>` and asserts the
   placeholder page content / title is in the document.
2. **Green** — implement the shell + page so the test passes.
3. **Refactor** — tidy providers/theme while keeping the test green.

## Verification

- `yarn dev` serves the app at `http://localhost:3000`.
- `yarn build` produces a `dist/` bundle; `yarn preview` serves it.
- `yarn test` runs and the first component test passes.
- The placeholder page renders, confirming React + Vite + TypeScript + the test
  runner are correctly wired.
- `.env.example` documents `VITE_API_BASE_URL` for when the API client is added.

## Open Questions

1. Routing, API client, MUI, React Query, Recharts: confirmed **deferred** to
   their feature plans (not installed in this setup plan).
2. API client choice (`axios` vs native `fetch`) to be decided in the feature
   plan that first calls the backend.

## Status Updates

- 2026-06-27: Created (draft)
- 2026-06-27: Updated — narrowed setup to install only setup-essential libraries
  (React, Vite, TypeScript, test/lint tooling); MUI, React Query, Recharts,
  React Router, and the API client are documented as the planned stack but
  deferred to their feature plans.
- 2026-06-27: Completed — Vite React+TS app scaffolded (React 19, Vite 8, TS 6).
  Configured dev server on port 3000 with `/api` → `:8080` proxy; added
  `.env.example` (`VITE_API_BASE_URL`) and git-ignored local `.env`. Replaced the
  Vite demo with a minimal `App` shell + `pages/HomePage` placeholder (providers
  left as documented extension points). Added Vitest + React Testing Library
  (jsdom) with `src/test/setup.ts` and a first passing `App` test via TDD (2
  tests green). Added Prettier (`.prettierrc`/`.prettierignore`) wired into the
  flat ESLint config via `eslint-config-prettier`, plus `test`/`test:watch`/
  `test:coverage`/`format`/`format:check` scripts. Verified: `yarn build`,
  `yarn lint`, `yarn format:check`, `yarn test` all pass and `yarn dev` serves
  `http://localhost:3000` (HTTP 200).
