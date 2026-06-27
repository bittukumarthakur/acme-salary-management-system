---
description: "Review an implemented story against acceptance criteria only. Use when: review story implementation, validate acceptance criteria, check story completion, acceptance-only review."
name: "Review Story Acceptance"
argument-hint: "Story name or file hint (for example: home page layout)"
agent: "agent"
---
Review implementation coverage for the requested story using acceptance criteria only.

Input:
- Story query: ${input:story:Story name or file hint}

Workflow:
1. Locate the target story in docs/story using the story query.
2. If multiple files match, use the ask-questions flow to let the user pick one.
3. If no file matches, ask for the exact story file name.
4. Read only these sections from the story:
   - Scope (In Scope and Out of Scope)
   - Acceptance Criteria
   - Open Questions and Assumptions
5. Inspect current code and tests relevant to the story.
6. Evaluate each acceptance criterion and classify it as:
   - Met
   - Partially met
   - Not met
   - Not applicable due to explicit out-of-scope
7. For each criterion, provide concise evidence with file references and test references where available.
8. Do not propose or assess architecture beyond what is needed to judge the listed criteria.
9. If evidence is insufficient, use the ask-questions flow to request the minimum clarification needed.

Output format:
- Story reviewed
- Acceptance criteria verdict table (criterion, status, evidence)
- Coverage summary (counts by status)
- Risks or gaps blocking completion
- Minimal next actions to reach full acceptance coverage
