# Home Page Layout & Empty Section Scaffolding

- **Date**: 2026-06-27
- **Status**: draft
- **Author**: BA Planner
- **Persona**: HR Admin

## User Story
As an HR Admin, I want a Home (Dashboard) page layout with a styled shell and clearly placed empty
sections that match the provided design, so that the team has a consistent visual foundation to plug
real data and features into during upcoming development.

## Background / Context
This is the first story for the Salary Management Portal home screen. The goal is **layout and visual
shell only** — no real data, no business logic, no API wiring. We are scaffolding the page so that
future stories (employee stats, payroll chart, recent payrolls, quick actions) can drop their content
into already-styled placeholder containers. The page must visually match the attached screenshot's CSS
(spacing, colors, typography, card styling, sidebar, header).

## Decisions (confirmed)
- **Styling approach**: **MUI** (Material UI) components and theming.
- **Icon library**: **MUI Material Icons**.
- **Placeholders**: **empty styled containers** that surface a **"Coming soon"** affordance — shown on
  hover (e.g. tooltip/overlay), or inline text when the container has enough space.
- **Sidebar collapse**: **visual-only** (interaction deferred).
- **Responsive**: **desktop-first only** for this story.
- **Design tokens**: **derive the palette/typography from the screenshot** and express them through an
  MUI theme.
- **Screenshot path**: `docs/assets/2026-06-27-home-page-dashboard.png` (link: [2026-06-27-home-page-dashboard.png](../assets/2026-06-27-home-page-dashboard.png)).

## Scope
### In Scope
- Overall page shell: left **sidebar**, top **header/topbar**, and main **content area**.
- Built with **MUI** components and a custom MUI theme derived from the screenshot.
- Empty sections present a **"Coming soon"** cue (hover tooltip/overlay, or inline text when space allows).
- Sidebar branding ("Salary Portal" + logo) and navigation items (Dashboard, Employees, Attendance,
  Payroll, Payslips, Reports, Settings) as **inert links** (no routing/behavior).
- Sidebar "Collapse" control rendered visually (collapse behavior is a placeholder/out of scope below).
- Header with page title ("Dashboard"), hamburger/menu icon, notification bell icon (with badge), and
  user profile chip ("HR Admin / Admin").
- Four **summary stat cards** rendered as empty/placeholder containers (Total Employees, Payroll
  Processed, Total Deductions, Net Salary Paid) — styled boxes with icon slots, no live values.
- **Payroll Summary** section: styled card with a header, a range selector control (visual only), and
  an empty chart placeholder area.
- **Recent Payrolls** section: styled card with header + "View all" link (inert) and an empty list area.
- **Quick Actions** section: styled card with four placeholder action tiles (Add Employee, Mark
  Attendance, Generate Payroll, View Payslips) — visual only, no actions wired.
- CSS/styling to match the screenshot: colors, spacing, rounded cards, shadows, fonts, layout grid.

### Out of Scope
- Real/dynamic data, API integration, or state management.
- Functional navigation/routing between pages.
- Working chart rendering with real datasets (placeholder area only).
- Sidebar collapse interaction logic, notifications logic, and profile menu actions.
- Responsive/mobile layout (see Open Questions — desktop-first assumed).
- Authentication, permissions, and settings behavior.

## Brainstorm Notes
- **Persona/problem**: HR Admins land on the home screen first; a polished, consistent shell sets the
  tone and unblocks parallel feature work without each story re-styling the page.
- **Value**: Establishes a reusable layout + design tokens so future feature stories are faster and
  visually consistent.
- **Assumptions**:
  - Desktop-first layout matching the screenshot; mobile/responsive deferred.
  - Placeholder numbers in the screenshot are illustrative; this story renders **empty** containers
    with a **"Coming soon"** cue rather than hardcoding the screenshot's exact figures.
  - Colors/tokens derived from the screenshot (indigo/navy sidebar, light gray background, white cards)
    and applied via an MUI theme.
  - Icons provided by **MUI Material Icons**.
  - Nav links and action tiles are inert; stubbed routes are deferred to later stories.
- **Dependencies**: Frontend app shell (React + TypeScript + Vite per repo conventions); **MUI**
  (`@mui/material`, `@mui/icons-material`) and its peer deps (Emotion).
- **Edge cases**:
  - Long employee/user names in the header profile chip should truncate gracefully.
  - Empty sections must reserve their final height so the layout doesn't shift when real data arrives.
  - Sidebar should keep fixed width; content area scrolls independently.

## Acceptance Criteria
- [ ] Given the app loads the Home page, when it renders, then the layout shows a left sidebar, a top
      header, and a main content area matching the screenshot's structure and CSS.
- [ ] Given the sidebar, when rendered, then it shows the "Salary Portal" branding and the nav items
      (Dashboard active, Employees, Attendance, Payroll, Payslips, Reports, Settings) plus a Collapse
      control — all visual/inert.
- [ ] Given the header, when rendered, then it shows the page title, menu icon, notification bell with
      a badge, and the user profile chip ("HR Admin / Admin").
- [ ] Given the content area, when rendered, then four summary stat cards appear as styled empty
      placeholder containers (no live values required).
- [ ] Given the content area, when rendered, then a Payroll Summary card (with range selector + empty
      chart placeholder), a Recent Payrolls card (with header + "View all" + empty list area), and a
      Quick Actions card (with four placeholder tiles) are present and styled.
- [ ] Given any empty placeholder section, when the user hovers it (or when space allows inline), then
      a **"Coming soon"** cue is shown.
- [ ] Given the implementation, when built, then the layout uses **MUI** components and **MUI Material
      Icons** with a theme whose palette/typography is derived from the screenshot.
- [ ] Given the page, when compared to the screenshot, then colors, spacing, card radius/shadows, and
      typography visually match the provided design (desktop viewport).
- [ ] Given any interactive-looking element (nav links, View all, range selector, action tiles), when
      clicked, then no navigation or behavior occurs (placeholders only) for this story.

## Screenshots / Mockups
> Note: the reference design was pasted in chat. Save it to the path below so this reference resolves.

- [2026-06-27-home-page-dashboard.png](../assets/2026-06-27-home-page-dashboard.png)

<details>
<summary>Preview: Home page (Dashboard) reference design</summary>

![Home page (Dashboard) reference design — sidebar, header, four summary stat cards, Payroll Summary chart card, Recent Payrolls list, and Quick Actions tiles.](../assets/2026-06-27-home-page-dashboard.png)

</details>

## Open Questions
- All design clarifications are resolved (see **Decisions (confirmed)** above).
- **Screenshot file**: the reference image was pasted in chat and could not be saved automatically
  (not available via file path or clipboard). Please place the file at
  `docs/assets/2026-06-27-home-page-dashboard.png` so the embed resolves.
