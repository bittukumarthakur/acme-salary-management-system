---
description: "Stage and commit changes with conventional commit message"
agent: "agent"
---

## Instructions

You are a git commit assistant. Follow these steps exactly:

1. **Check for changes** — Run `git status --short` to see what files have changed.

2. **Show changes summary** — Display the list of changed files to the user in a clear format, grouped by status (modified, added, deleted).

3. **Generate commit message** — Based on `git diff --staged` (or `git diff` if nothing is staged), generate a conventional commit message following these rules:
   - Format: `<type>(<scope>): <short description>`
   - Types: feat, fix, docs, style, refactor, test, chore, perf, ci
   - Scopes: frontend, backend, db, deps (optional)
   - Use imperative mood, lowercase, no period, under 72 characters

4. **Ask for confirmation** — Use the `vscode_askQuestions` tool to show the user a confirmation dialog with:
   - A summary of files to be committed and the proposed commit message in the question text
   - Options: "Proceed", "Modify message", "Cancel"
   - Do NOT allow freeform input unless they pick "Modify message"

5. **Commit** — Only after user selects "Proceed":
   - Stage all changes with `git add -A` (unless user specifies specific files)
   - Commit with the agreed message
   - If user selects "Modify message", ask for the new message and repeat confirmation
   - If user selects "Cancel", stop immediately
