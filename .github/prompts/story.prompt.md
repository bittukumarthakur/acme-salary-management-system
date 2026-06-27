---
description: "Capture a feature request and generate a BA user story under docs/story. Use when you want to start a new story: prompts for the key fields, then hands off to the BA Planner to brainstorm and write the story markdown (embedding any screenshots)."
name: "Story"
agent: "BA Planner"
argument-hint: "Feature name + a sentence on what it does (attach screenshots if any)"
---
Create a new user story for the feature described below, then save it under `docs/story/` using
the BA Planner story template and naming convention.

Fill in whatever the user supplied from this intake. Before drafting, ask direct clarifying
questions for any major gaps and present options when possible. If items remain unanswered,
proceed with explicit assumptions under **Open Questions / Assumptions**.

## Feature Intake
- **Feature name**: ${input:feature:Short feature name}
- **Persona / primary user**: ${input:persona:Who uses this? (default: HR Manager)}
- **What they want to do**: ${input:capability:The capability, one sentence}
- **Why it matters / benefit**: ${input:benefit:The value or outcome}
- **In scope**: ${input:inScope:What this story covers}
- **Out of scope**: ${input:outScope:What this story explicitly excludes}

## Instructions
1. Ask direct clarifying questions first under this heading when needed:
   **Open questions / assumptions to confirm**.
   Keep it concise (about 4-7 questions) and include options for each question.
2. Brainstorm the feature: persona, problem, value, edge cases, dependencies, and assumptions.
3. If the user attached screenshots/mockups:
   - Save each image under `docs/assets/` using a date-prefixed kebab-case filename when possible.
   - Use terminal commands only when needed to save the attached image, and run only the minimum
     required command(s) for saving (for example `mkdir -p`, `cp`, or `mv`).
   - If automatic save is not possible, ask one direct follow-up for the source path, filename,
     and placement under `docs/assets/`.
   - Embed every provided image in **Screenshots / Mockups** with this format: a clickable markdown
     link to `../assets/<file>` and a `<details>` block containing a markdown image preview with a
     descriptive caption.
4. Write the story to `docs/story/YYYY-MM-DD-<kebab-case-feature-name>.md` using the standard
   story template (User Story, Background, Scope, Brainstorm Notes, Acceptance Criteria,
   Screenshots / Mockups, Open Questions).
5. Reply with a one-paragraph summary, a bullet list of open questions / assumptions, a
   markdown link to the new story file, and a bullet list of saved screenshot paths.
