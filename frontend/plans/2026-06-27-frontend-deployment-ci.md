# Frontend Deployment CI — Cloudflare Pages

- **Date**: 2026-06-27
- **Status**: completed

## Summary

Add a CI/CD pipeline for the `frontend/` app that runs tests on every push and
deploys the built Vite SPA to **Cloudflare Pages**. Supporting changes scope the
shared GitHub variables so frontend and backend no longer collide, and migrate
the frontend to Yarn Berry (v4) so immutable installs succeed in CI.

## Steps

1. Add `.github/workflows/deploy-frontend.yml` with two jobs:
   - `test`: `yarn install --immutable`, `yarn test:coverage`, and a coverage
     summary table (requires the Vitest `json-summary` reporter).
   - `deploy`: build with `yarn build`, then deploy `dist/` to Cloudflare Pages
     via `cloudflare/wrangler-action@v3` (`pages deploy dist`).
2. Configure SPA history fallback for Cloudflare Pages with
   `frontend/public/_redirects` (`/* /index.html 200`).
3. Scope shared GitHub variables to avoid frontend/backend collisions:
   - `PORT` → `FRONTEND_PORT` / `BACKEND_PORT`.
   - (Prisma-era) `COMPUTE_SERVICE_ID` → `FRONTEND_COMPUTE_SERVICE_ID` /
     `BACKEND_COMPUTE_SERVICE_ID`.
4. Migrate `frontend/` to Yarn Berry 4.17.0 so CI immutable installs succeed:
   - `yarn set version stable`, `nodeLinker: node-modules`.
   - Migrate the v1 lockfile in place to Berry format (preserve resolutions).
   - Commit `.yarnrc.yml` and `.yarn/releases/yarn-4.17.0.cjs`; update `.gitignore`.
   - Use `yarn install --immutable` in the workflow.

## Required GitHub configuration

- **Secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- **Variables:** `CLOUDFLARE_PAGES_PROJECT`, `VITE_API_BASE_URL`.

## Notes

- An earlier iteration targeted Prisma Compute, which always runs a process (no
  static mode). That required a custom entrypoint (`server.mjs`); Cloudflare Pages
  serves the static build directly, so `server.mjs` and the Prisma-specific vars
  (`PRISMA_API_TOKEN`, `FRONTEND_COMPUTE_SERVICE_ID`, `FRONTEND_PORT`) are no
  longer used.

## Status Updates

- 2026-06-27: Created (documenting completed CI work).
- 2026-06-27: Completed — frontend deploys to Cloudflare Pages on push to `main`.
