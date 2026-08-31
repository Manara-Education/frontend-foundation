# Manara — Responsive UI Remediation Programme

Tracking board for the repository-wide responsive remediation.
Companion to [`RESPONSIVE_AUDIT.md`](./RESPONSIVE_AUDIT.md).

**Integration branch:** `develop` · **Base commit:** `cc1dd81`
**Status legend:** `BACKLOG` · `READY` · `IN PROGRESS` · `TESTING` · `REVIEW` · `DONE` · `BLOCKED`

---

## Programme status

| | |
| --- | --- |
| Phase | Wave 0 — awaiting go-ahead on delivery-workflow substitution |
| Screens audited | 24 / 24 |
| Screens visually verified | 8 / 24 (blocked: no backend — see Wave 0) |
| P0 open | 3 |
| P1 open | 5 |

---

## Global Definition of Done

A workstream is `DONE` only when **all** of the following hold for every screen it owns:

**Layout** — no element's border box extends beyond the viewport at 320/360/375/390/412/430/768/1024 px
(per-element check, *not* only `scrollWidth > clientWidth`); no clipped content; no overlapping
components; no control outside the viewport; no `overflow-x: hidden` used to suppress a defect.
**Navigation** — every entry reachable; mobile navigation behaves correctly; back/route behaviour unchanged.
**Forms** — inputs fit; labels readable; validation wraps; primary action reachable with the keyboard open.
**Content** — long Arabic strings, long single words and instructor-authored rich content wrap without breaking layout.
**Actions** — action groups wrap or stack; touch targets ≥ 44 × 44 CSS px.
**Overlays** — dialogs fit the viewport, scroll internally, keep focus, close reachable.
**RTL** — direction, spacing, alignment, icon and arrow direction correct; logical properties used.
**Regression** — desktop unchanged; business logic unchanged; no API contract change.
**Gates** — `npm run typecheck`, `npm test`, `npm run build` all pass; CI green; review resolved.

---

## Workstreams

### Wave 0 — verification infrastructure

| Field | Value |
| --- | --- |
| Agent | Verification Harness |
| Branch | `feat/responsive-verification-harness` |
| Owns | `src/test/**` (new viewport helpers), `tools/mock-api/**` (new), `vitest.config.ts` |
| Must not modify | any `src/features/**`, `src/app/**`, `src/styles/**` |
| Depends on | — |
| Status | `READY` |
| Why | 16 of 24 screens are unreachable without a backend on `:8081`. Without this, the DoD's visual + interaction verification cannot be met for any P0-affected screen. |

### Wave 1 — foundation and shell

| Agent | Branch | Owns | Must not modify | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| Responsive Foundation | `feat/responsive-foundation` | `src/styles/**`, `index.html`, `src/shared/responsive/**` (new) | `src/features/**`, `src/app/**` | Wave 0 | `BACKLOG` |
| Application Shell | `fix/responsive-shell` | `src/app/layout/**`, `src/features/main/components/sidebar.tsx`, `nav-sections.ts`, `src/features/session/**` | `src/styles/**`, `src/features/{course,lesson,quiz,banner,profile,auth,landing}/**` | Foundation | `BACKLOG` |

### Wave 2 — independent features

| Agent | Branch | Owns | Depends on | Status |
| --- | --- | --- | --- | --- |
| Landing | `fix/responsive-landing` | `src/features/landing/**` | Foundation | `BACKLOG` |
| Authentication | `fix/responsive-auth` | `src/features/auth/**` | Foundation | `BACKLOG` |
| Instructor Dashboard | `fix/responsive-dashboard` | `src/features/main/instructor/**` | Shell | `BACKLOG` |
| Course Discovery | `fix/responsive-discover` | `src/features/course/student/{explore,courses}/**` | Shell | `BACKLOG` |
| Profile & Settings | `fix/responsive-profile` | `src/features/profile/**` | Shell | `BACKLOG` |
| Banners | `fix/responsive-banners` | `src/features/banner/**` | Shell | `BACKLOG` |

### Wave 3 — dependent features

| Agent | Branch | Owns | Depends on | Status |
| --- | --- | --- | --- | --- |
| Course Details | `fix/responsive-course-details` | `src/features/course/student/course-details/**` | Shell, Foundation | `BACKLOG` |
| Student Learning | `fix/responsive-student-learning` | `src/features/lesson/student/**`, `src/shared/rich-content/**`, `src/shared/video/**` | Shell, Foundation | `BACKLOG` |
| Exams & Quizzes | `fix/responsive-quizzes` | `src/features/quiz/**`, `course-editor/components/{quiz-builder,course-exams-editor}.tsx` | Foundation | `BACKLOG` |
| Instructor Courses | `fix/responsive-instructor-courses` | `src/features/course/student/all-courses/**`, `src/features/course/components/**` | Shell | `BACKLOG` |
| Course Editor | `fix/responsive-course-editor` | `src/features/lesson/instructor/**`, `course-editor/components/*` (excl. quiz + rich-content) | Shell, Foundation | `BACKLOG` |
| Course Creation | `fix/responsive-create-course` | `src/features/course/Instructor/create-course/**` | Shell, Foundation | `BACKLOG` |
| Pricing & Enrollment | `fix/responsive-pricing` | `course-editor/components/{access-type,subscription-plans,visibility}-section.tsx`, `course-details/components/{checkout-*,payment-cta,subscription-*}.tsx` | Course Details | `BACKLOG` |

### Wave 4 — integration

| Agent | Branch | Owns | Depends on | Status |
| --- | --- | --- | --- | --- |
| Responsive QA | `chore/responsive-qa-sweep` | `docs/responsive-ui/**` (report only) | all | `BACKLOG` |
| Principal Review & Refactor | `refactor/responsive-consistency` | cross-cutting, by finding | QA | `BACKLOG` |

---

## Shared-file ownership register

Exactly one agent may modify each of these. A feature agent that needs a change here
raises it to the orchestrator; the owner implements it; the feature agent rebases.

| File / directory | Sole owner |
| --- | --- |
| `src/styles/**` | Responsive Foundation |
| `index.html` | Responsive Foundation |
| `src/shared/responsive/**` (new) | Responsive Foundation |
| `src/app/layout/**` | Application Shell |
| `src/app/routes.tsx` | Application Shell |
| `src/features/main/components/sidebar.tsx`, `nav-sections.ts` | Application Shell |
| `src/shared/components/**` | Responsive Foundation |
| `src/shared/navigation/**` | Application Shell |
| `vitest.config.ts`, `src/test/**` | Verification Harness |

---

## Decision log

| Date | Decision |
| --- | --- |
| 2026-08-31 | Base all work on `develop` (`cc1dd81`), per `CONTRIBUTING.md`. Local `develop` was 2 commits behind `origin/develop`; the current branch `fix/rich-content-list-formatting` is already merged upstream as `#77` and is not a valid base. |
| 2026-08-31 | The Ship skill (`/ship:use-ship`, `/ship:auto`) is **not installed** in this environment — only `clangd-lsp` and `figma` plugins are present. Gate mapping to installed equivalents is pending user confirmation. |
| 2026-08-31 | `scrollWidth > clientWidth` alone is rejected as the overflow gate: `landing-content.tsx` sets `overflow-x: hidden`, which zeroes that signal while content is clipped off-viewport. Per-element bounding-box checks are the gate. |
