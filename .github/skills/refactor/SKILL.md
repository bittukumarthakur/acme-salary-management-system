# Refactoring Skill

**Purpose:** Break down complex code into smaller, reusable, well-structured components while applying best practices and maintaining code quality.

**Use when:** 
- "Refactor this code" / "break down this component" / "extract and reuse"
- "Apply best practices to this file" / "improve this code structure"
- "Split this into smaller pieces" / "reduce duplication"
- "Refactor with component extraction" / "modularize this"

**Triggers:** "refactor", "extract", "break down", "component extraction", "reduce duplication", "modularize", "improve structure"

**Output:** Refactored code artifacts with reduced duplication, extracted subcomponents/functions, improved typing, and clear separation of concerns.

---

## Part 1: Quick Refactoring Checklist (5 mins)

Use this checklist to quickly scan and apply refactoring patterns without deep analysis. Works for small files and incremental changes.

### Step 1: Identify Refactoring Opportunities

- [ ] **Duplicate Logic** — Same logic appears 2+ times?  
  → Extract to a shared function / hook / utility

- [ ] **Overly Long Function** — Function > 50 lines or doing 3+ things?  
  → Split into smaller functions with single responsibility

- [ ] **Deep Nesting** — 3+ levels of `if/else`, `try/catch`, or component nesting?  
  → Extract nested blocks into separate functions / components

- [ ] **Magic Strings/Numbers** — Hard-coded values scattered throughout?  
  → Move to `constants.ts` or configuration object

- [ ] **Type Leakage** — Exposing ORM types, API response shapes, or internal contracts?  
  → Create domain models / DTOs, map at boundaries

- [ ] **Callback Hell** — Multiple nested callbacks or promise chains?  
  → Use `async/await`, extract callbacks into named functions

- [ ] **Unused Imports/Variables** — Dead code or stale dependencies?  
  → Remove or comment with reason

### Step 2: Choose Refactoring Patterns

Based on the opportunities above, apply these patterns:

| Opportunity | Pattern | Example |
|---|---|---|
| Duplicate logic | Extract function / custom hook | `parseQuery()` extracted to utils |
| Long function | Break into smaller functions | `handleSubmit()` → `validate()` + `submit()` + `handleSuccess()` |
| Deep nesting | Guard clause / early return | Replace `if (x) { if (y) { ... } }` with `if (!x) return; if (!y) return;` |
| Magic values | Constants object | `const SORT_FIELDS = { name: 'name', date: 'date' }` |
| Type leakage | Domain model + mapper | `toEmployee(prismaRow)` converts ORM → domain |
| Nested callbacks | async/await + extraction | Convert callback chains to `await` syntax |

### Step 3: Quick Apply

1. Identify 1–3 highest-impact patterns from the checklist
2. Apply one pattern at a time (test after each)
3. Run linter/formatter
4. Confirm no regressions with existing tests

**When to escalate:** If you need to extract 3+ new components, refactor affects multiple files, or there are deep architectural changes → move to **Part 2: Full Workflow**.

---

## Part 2: Full Refactoring Workflow (20–60 mins)

Use this structured workflow for complex refactorings, large files, or when extracting multiple components.

### Phase 1: Analysis (5 mins)

#### 1.1 — Read the Current Code  
- Understand the entry point and data flow
- Identify all responsibilities (I/O, state, presentation, business logic)
- Note dependencies (internal and external)

#### 1.2 — Document Existing Behavior  
- Write or verify unit tests cover the current behavior
- Run tests to establish a baseline (must be green)
- Note any side effects or special cases

#### 1.3 — Map Responsibilities  
Create a mental model:

```
CurrentFile
├── Input parsing (responsibility A)
├── Business logic (responsibility B)  
├── State management (responsibility C)
└── Output formatting (responsibility D)
```

If > 3 responsibilities, refactoring is justified. If ≤ 2, consider whether splitting is worth the overhead.

#### 1.4 — Identify Extraction Targets  
For each responsibility, ask:
- Can this stand alone?
- Will it be reused?
- Can it be tested independently?

If **yes** to any → it's a candidate for extraction.

### Phase 2: Planning (5–10 mins)

#### 2.1 — Design New Structure  
Sketch the target state:

```
NewFile (or existing)
├── NewComponent1 / newFunction1 (responsibility A)
├── NewComponent2 / newFunction2 (responsibility B)
└── Index re-exports them

Original file
└── Import and compose NewComponent1 + NewComponent2
```

#### 2.2 — Define Interfaces  
For each extracted piece, define its **contract**:

**React component:**
```typescript
interface ChildComponentProps {
  data: Employee[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
}
```

**Function/hook:**
```typescript
function useEmployeeQuery(filters: QueryFilters) 
  : { data: Employee[]; isLoading: boolean; error?: Error }
```

**Utility:**
```typescript
export function parseQueryParams(search: string): QueryFilters
```

#### 2.3 — Dependency Analysis  
List what each new piece needs:
- Props / parameters
- External dependencies (services, libraries)
- Shared state / context

Minimize cross-dependencies; if A and B both need X, consider making X a parameter rather than hoisting to a shared context.

#### 2.4 — Testing Strategy  
Plan how to test each extracted piece **before** implementing:
- Unit tests for pure functions (inputs → outputs)
- Component tests for UI logic (mock child components, test interaction)
- Integration tests for hooks (test with real or mocked API calls)

### Phase 3: Implementation (10–40 mins)

#### 3.1 — Create New Files  
For each extraction target, create the new file(s):

```
src/
  models/
    employee/
      employee.ts          ← domain model
      query.ts             ← query types & helpers
  components/
    EmployeeTable/
      EmployeeTable.tsx    ← parent
      TableRow.tsx         ← extracted
      index.ts             ← barrel export
  hooks/
    useEmployeeQuery.ts    ← extracted hook
```

#### 3.2 — Write Tests First (TDD)  
Write tests for each new piece **before** moving code:

```typescript
// NEW FILE: test/hooks/useEmployeeQuery.test.ts
describe('useEmployeeQuery', () => {
  it('fetches employees on mount', async () => {
    // test here
  });
});

// NEW FILE: test/components/EmployeeTable/TableRow.test.tsx  
describe('<TableRow />', () => {
  it('calls onSelect when clicked', () => {
    // test here
  });
});
```

#### 3.3 — Move & Adapt Code  
1. Copy the responsibility logic to the new file
2. Update the interface (remove/add props as planned)
3. Add type annotations
4. Run the new tests — they should pass
5. Delete the old code from the original file
6. Update imports in the original file

#### 3.4 — Run Full Test Suite  
```bash
yarn test
```

Ensure:
- New tests pass
- Existing tests still pass (no regressions)
- Coverage doesn't drop significantly

#### 3.5 — Lint & Format  
```bash
yarn lint --fix
yarn format
```

### Phase 4: Review & Validation (5–10 mins)

#### 4.1 — Code Review Checklist  
- [ ] Each extracted piece has a single, clear responsibility
- [ ] No circular dependencies (A imports B, B imports A)
- [ ] Types are explicit (no `any`, proper domain models)
- [ ] Tests cover happy path + edge cases
- [ ] Imports are clean (no unused, no relative path soup)
- [ ] Comments explain "why", not "what"

#### 4.2 — Verify No Duplication  
Search the codebase for the old patterns:
```bash
# Check if old logic patterns still exist elsewhere
grep -r "old_function_name" src/
```

If found → extract to a shared location, update callers.

#### 4.3 — Performance Check (if applicable)  
For React components:
- Did extraction introduce unnecessary re-renders?
- Use React DevTools Profiler to spot regressions
- Memoize if a child re-renders too frequently

For functions:
- Did extraction add unnecessary overhead (e.g., multiple loops instead of one)?
- Benchmark before/after if performance-sensitive

#### 4.4 — Document & Commit  
Add a plan tracking file if this is a significant refactoring:

```markdown
# [date]-refactor-[component-name].md

- **Date**: YYYY-MM-DD
- **Status**: completed

## Summary

Refactored [file/component] by extracting [X, Y, Z] into separate [files/hooks].

## Changes

- Extracted `TableRow` component from `EmployeeTable`
- Created `useEmployeeQuery` hook for data fetching
- Moved query parsing to `queryParams.ts` utility

## Test Coverage

- All new functions/components have unit tests
- Existing tests pass with no regressions
```

Then commit:
```bash
git add -A
git commit -m "refactor: extract TableRow, useEmployeeQuery, improve EmployeeTable structure"
```

---

## Best Practices Applied

### 1. **Single Responsibility Principle (SRP)**  
Each function/component does one thing well. If it does more, split it.

### 2. **DRY (Don't Repeat Yourself)**  
Identical or near-identical logic → shared function / hook.

### 3. **Clear Naming**  
Name reflects responsibility:
- `fetchEmployees` (what it does)
- `useEmployeeQuery` (hook, state + side effects)
- `parseQueryParams` (pure function, input → output)
- `EmployeeTable` (component, renders something)

### 4. **Domain Models**  
Never expose ORM/API internals. Create DTOs:

```typescript
// ✗ Bad: leaking Prisma type
export type Employee = PrismaClient.Employee;

// ✓ Good: domain model
export interface Employee {
  id: string;
  name: string;
  joiningDate: string; // YYYY-MM-DD, not Date object
  department: string;
}

// Mapper at service boundary
export function toEmployee(row: PrismaClient.Employee): Employee { ... }
```

### 5. **Type Safety**  
Use TypeScript strictly:
- No `any` (use `unknown` if truly dynamic, then narrow)
- Explicit parameter types
- Explicit return types
- `satisfies` for test fixtures

### 6. **Test-Driven**  
Write tests before moving code (TDD red-green-refactor). Tests act as living documentation and catch regressions.

### 7. **Barrel Exports**  
Group related code with index re-exports:

```typescript
// src/models/employee/index.ts
export type { Employee, EmployeeQuery } from './employee.ts';
export type { SortField } from './query.ts';
export { toEmployee } from './employee.ts';

// Consumer
import { Employee, toEmployee } from '../models/employee';
```

### 8. **Minimize Dependencies**  
Each extracted piece should know as little as possible about others. Pass dependencies as parameters or props, not globals/singletons.

### 9. **Reusability**  
If extracted, it should be reused in at least 2 places (or likely to be soon). If not → keep it inlined to reduce files.

### 10. **Documentation**  
Comment the "why" (design decisions), not the "what" (the code is readable).

```typescript
// ✗ Bad
// increment x
x++;

// ✓ Good
// Include margin for floating-point rounding errors
threshold = baseThreshold + ROUNDING_BUFFER;
```

---

## Examples by Language

### React Component Extraction

**Before:**
```typescript
function EmployeeTable({ employees }) {
  const [sortBy, setSortBy] = useState('name');
  const sorted = [...employees].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));

  return (
    <table>
      <tbody>
        {sorted.map(emp => (
          <tr key={emp.id}>
            <td onClick={() => setSortBy('name')}>{emp.name}</td>
            <td>{emp.department}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**After:**
```typescript
// TableRow.tsx — extracted
function TableRow({ employee, onNameClick }) {
  return (
    <tr>
      <td onClick={() => onNameClick('name')}>{employee.name}</td>
      <td>{employee.department}</td>
    </tr>
  );
}

// EmployeeTable.tsx — now simple
function EmployeeTable({ employees }) {
  const [sortBy, setSortBy] = useState('name');
  const sorted = useMemo(() => sortEmployees(employees, sortBy), [employees, sortBy]);

  return (
    <table>
      <tbody>
        {sorted.map(emp => (
          <TableRow key={emp.id} employee={emp} onNameClick={setSortBy} />
        ))}
      </tbody>
    </table>
  );
}
```

### Hook Extraction

**Before:**
```typescript
useEffect(() => {
  const fetchData = async () => {
    const res = await fetch(`/api/employees?${new URLSearchParams(filters)}`);
    const data = await res.json();
    setEmployees(data);
  };
  fetchData();
}, [filters]);
```

**After:**
```typescript
// useEmployeeQuery.ts
function useEmployeeQuery(filters: QueryFilters) {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/employees?${new URLSearchParams(filters)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return { data, loading, error };
}

// Usage
const { data, loading, error } = useEmployeeQuery(filters);
```

### Utility Function Extraction

**Before:**
```typescript
const query = new URLSearchParams();
query.append('sort', sortBy);
query.append('filter', JSON.stringify(filterObj));
const url = `/api/employees?${query.toString()}`;
```

**After:**
```typescript
// queryParams.ts
export function buildQueryString(filters: QueryFilters, sortBy: string): string {
  const query = new URLSearchParams();
  query.append('sort', sortBy);
  query.append('filter', JSON.stringify(filters));
  return query.toString();
}

// Usage
const url = `/api/employees?${buildQueryString(filters, sortBy)}`;
```

### Constants & Config Extraction

**Before:**
```typescript
const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Department', value: 'department' },
  { label: 'Joining Date', value: 'joiningDate' },
];
// Repeated in multiple files
```

**After:**
```typescript
// constants.ts
export const SORT_OPTIONS = {
  NAME: 'name',
  DEPARTMENT: 'department',
  JOINING_DATE: 'joiningDate',
} as const;

export const SORT_LABELS: Record<typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS], string> = {
  [SORT_OPTIONS.NAME]: 'Name',
  [SORT_OPTIONS.DEPARTMENT]: 'Department',
  [SORT_OPTIONS.JOINING_DATE]: 'Joining Date',
};

// Usage
Object.entries(SORT_LABELS).map(([value, label]) => ({ label, value }))
```

---

## Quality Gates

Before considering a refactoring complete:

- [ ] **Functionality** — All tests pass, behavior unchanged
- [ ] **Types** — No `any`, proper domain models, explicit contracts
- [ ] **Naming** — Each piece has a clear, descriptive name
- [ ] **Duplication** — No significant duplication remains (or extracted to shared location)
- [ ] **Dependencies** — Minimal coupling, no circular imports
- [ ] **Tests** — New tests cover extracted pieces, coverage maintained or improved
- [ ] **Docs** — Comments explain why, not what; code is readable
- [ ] **Performance** — No regressions (profiled if applicable)
- [ ] **Lint/Format** — No warnings, consistent style

---

## When NOT to Refactor

- Code is working, tests are green, and there's no duplication → **leave it alone**
- Refactoring would require changing behavior or tests → **fix tests first, then refactor**
- Deadline is approaching and risk is high → **defer to a separate PR**
- You don't understand the code well enough → **read/test thoroughly first**

---

## Suggested Prompts to Use This Skill

- `/refactor` — Refactor the current file
- `refactor: break this component into smaller pieces` — Full workflow with component extraction
- `refactor: extract duplicate logic to a utility function` — Quick checklist, focus on duplication
- `refactor: improve type safety in this service` — Full workflow, focus on typing
- `refactor: apply best practices to this code` — Full checklist + workflow
- `refactor with component extraction and state management` — Multi-component workflow

---

## Related Skills

- **TDD** — Write tests first, then implement (used in Phase 3.2 of this skill)
- **agent-customization** — Customize and extend this skill
- **commit** — Safely commit refactored code with tests passing

---

## Next Steps

1. **Try the quick checklist** on a small file you want to improve
2. **Run tests** after each change to catch regressions
3. **If multi-component extraction is needed**, escalate to the full workflow
4. **Record learnings** in your project's `sharing-learnings` notes if you discover new patterns
