# Plan Tracking

Whenever a plan is created (e.g., using Copilot's Plan mode), a tracking file **must** be saved in the `plans/` directory at the project root.

## File Naming

```
plans/YYYY-MM-DD-<short-description>.md
```

- Use the current date as a prefix for chronological sorting
- Use kebab-case for the description (e.g., `2026-06-24-add-auth-module.md`)

## Required Content

Every plan tracking file must include these sections:

```markdown
# <Plan Title>

- **Date**: YYYY-MM-DD
- **Status**: draft | in-progress | completed

## Summary

<Brief description of what this plan aims to accomplish>

## Steps

1. Step one
2. Step two
3. ...

## Status Updates

- YYYY-MM-DD: Created
```

## Rules

- Create the file at the **start** of planning, with status `draft`
- Update status to `in-progress` once work begins
- Update status to `completed` when all steps are done
- Each plan gets its own file — do not combine multiple plans into one file
