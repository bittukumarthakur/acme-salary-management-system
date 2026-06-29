---
name: commit
description: 'Stage and commit changes safely with a Conventional Commit message after running build, tests, formatting, and lint checks. Use when the user asks to commit, "/commit", "create a commit", "commit my changes", or wants pre-commit verification (build / run tests / eslint / format) before committing in this Yarn monorepo (frontend + backend).'
argument-hint: 'Optional: scope hint or message override'
---

# Commit

Create a clean, verified commit. Never commit code that fails build, tests,
lint, or formatting. Always confirm the message with the user before
committing.

## When to Use

- The user asks to commit changes or invokes `/commit`.
- The user wants pre-commit checks (build, tests, lint, format) run first.
- Finalizing a unit of work in the `frontend/` or `backend/` packages.

## When NOT to Use

- Pushing, force-pushing, amending published commits, or rewriting history
  (ask the user explicitly — these are out of scope).
- Resolving merge conflicts or rebasing.

## Procedure

### 1. Inspect changes

Run `git status --short` and group the output for the user:

- **Modified**, **Added**, **Deleted**, **Renamed**, **Untracked**

If there are no changes, stop and tell the user there is nothing to commit.

### 2. Determine affected areas

Inspect the changed paths to decide which packages are touched:

- Paths under `backend/` → run backend checks.
- Paths under `frontend/` → run frontend checks.
- Both → run both. Root-only changes (docs, workflows) → skip package checks.

Only run checks for areas that actually changed to keep the loop fast.

### 3. Run pre-commit verification (must pass before committing)

For each affected area, run the checks below from that package directory. The
available scripts differ per package — only run scripts that exist in that
package's `package.json`.

**Backend (`backend/`):**

```bash
cd backend
yarn install --frozen-lockfile   # only if dependencies changed
yarn build                       # tsc
yarn format:check                # prettier --check (no lint script here)
yarn test                        # Jest
```

**Frontend (`frontend/`):**

```bash
cd frontend
yarn install --immutable         # only if dependencies changed (Yarn Berry)
yarn build                       # tsc -b && vite build
yarn lint                        # eslint .
yarn format:check                # prettier --check
yarn test                        # Vitest
```

**Formatting fixes:** If `format:check` fails, run `yarn format` to auto-fix,
then re-run `git status --short` so reformatted files are included in the commit
and shown to the user before confirmation.

### 4. Handle failures

- If any check fails, **stop**. Do not commit.
- Show the failing output concisely and offer to fix the issues.
- Fix only with the user's direction (or obvious auto-format), then re-run the
  failed checks until green.

### 5. Generate the commit message

Base it on `git diff --staged` (or `git diff` if nothing is staged). Follow
Conventional Commits:

- Format: `<type>(<scope>): <short description>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`
- Scopes (optional): `frontend`, `backend`, `db`, `deps`
- Imperative mood, lowercase, no trailing period, subject under 72 characters
- Add a body only when the change needs explanation (wrap at ~72 cols)

### 6. Confirm with the user

Use the `vscode_askQuestions` tool to show:

- The grouped list of files to be committed
- A summary of pre-commit check results (pass/skip)
- The proposed commit message

Options: **Proceed**, **Modify message**, **Cancel**. Do NOT allow freeform
input unless the user picks "Modify message".

### 7. Commit

Only after the user selects **Proceed**:

```bash
git add -A   # unless the user named specific files
git commit -m "<agreed message>"
```

- **Modify message** → collect the new message, then repeat step 6.
- **Cancel** → stop immediately, make no commit.

After committing, report the short SHA and one-line summary. Do not push unless
the user explicitly asks.

## Quality Checklist

- [ ] `git status` reviewed and grouped
- [ ] Build passes for all affected areas
- [ ] Tests pass for all affected areas
- [ ] Lint passes for all affected areas
- [ ] Formatting applied/verified; reformatted files staged
- [ ] Message is valid Conventional Commit (<72 char subject)
- [ ] User confirmed via the questions dialog before committing
- [ ] No push / history rewrite without explicit request
