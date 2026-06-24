# Seed Database with Employee Dummy Data

- **Date**: 2026-06-24
- **Status**: completed

## Summary

Create and wire a backend seed process that populates the SQLite database with 10,000 realistic employee records using Prisma and Faker.

## Steps

1. Add a Prisma seed script at `backend/prisma/seed.ts`.
2. Install `@faker-js/faker` as a dev dependency for generating names, emails, and realistic employee details.
3. Configure `backend/package.json` with a `seed` script that ensures the database schema exists before seeding.
4. Run the seed script and verify 10,000 `Employee` records are created.
5. Validate record distribution across countries, departments, employment types, and statuses.

## Status Updates

- 2026-06-24: Created
