---
description: "Implement a story from docs/story by name using TDD-first execution and iterative visual approval. Use when: implement story, start story implementation, build from story md, execute story requirements."
name: "Implement Story"
argument-hint: "Story name or file hint (for example: home page layout)"
agent: "agent"
---
Implement the requested story from docs/story by using the story name provided in chat input.

Input:
- Story query: ${input:story:Story name or file hint}

Workflow:
1. Locate the target story in docs/story using the story query.
2. If multiple files match, use the ask-questions flow to present options and ask the user to select one.
3. If no file matches, ask for the exact story file name.
4. Read and extract implementation requirements from the story:
   - User Story
   - Scope (In Scope and Out of Scope)
   - Acceptance Criteria
   - Open Questions and Assumptions
5. Convert acceptance criteria into an implementation checklist and execute in priority order.
6. Enforce TDD for every behavior change:
   - Red: write or update a failing test for the next acceptance criterion.
   - Green: implement the minimum code to pass.
   - Refactor: improve code while keeping tests green.
   - Run relevant tests after each cycle.
7. Use project conventions from repository instructions and existing test patterns.
8. If requirements are ambiguous or conflicting, use the ask-questions flow to ask concise clarifying questions before coding.
9. Keep changes scoped to the story. Do not implement out-of-scope items.
10. After implementation, verify changes before finalizing:
   - Re-check each acceptance criterion against implemented behavior.
   - Run relevant tests and validations for changed areas.
   - Confirm no obvious regressions in touched flows.
11. After implementation and test verification, run visual validation when the story includes a mockup/screenshot asset:
   - Start the app (or verify the dev server is running).
   - Open the implemented UI and open the exact mockup asset file used for implementation.
   - Ask the user to verify visuals using ask-questions with these options:
     - Looking good, proceed with review-story
     - Need some change
   - Wait for user confirmation and do not proceed to review-story until the user explicitly selects the first option.
12. If the user selects Need some change:
   - Capture the requested visual changes.
   - Implement the changes using TDD where behavior is affected.
   - Re-run relevant tests/validations.
   - Repeat the same visual validation loop (step 11) until the user confirms satisfaction.
13. If the user selects Looking good, proceed with review-story:
   - Run the Review Story Acceptance prompt for the same story.
   - Include the acceptance review verdicts in the final output.
14. After implementation (and review when approved), report:
   - Completed acceptance criteria
   - Files changed
   - Tests run and results
   - Any deferred items or follow-up tasks

Execution rules:
- Prefer reusing established components and patterns over introducing new architecture.
- If frontend and backend are both affected, sequence work in small verified increments.
- If a required dependency or environment setup is missing, explain the blocker and propose the smallest unblocking step.
