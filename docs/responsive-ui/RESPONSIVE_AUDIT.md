# Manara — Responsive UI Audit

**Audited commit:** `origin/develop` @ `cc1dd81`
**Date:** 2026-08-31
**Method:** repository reconnaissance + live viewport probe (`documentElement.scrollWidth`
vs `clientWidth`, plus per-element bounding-box overflow detection) against the Vite dev
server at 320 / 360 / 375 / 768 px.

---

## 1. Architecture summary

| Concern | What the repo actually does |
| --- | --- |
| Framework | React 19 + `react-router` 8, Vite 8, TypeScript strict |
| Routing | One central table, `src/app/routes.tsx`. Every screen has a real address. Route `handle` metadata carries `title`, `subtitle`, `section`, `contentWidth` |
| Signed-in shell | `src/app/layout/app-layout.tsx` — flex row: scrolling `<main>` + fixed 280 px `<aside>` sidebar |
| Styling | **Inline `style={{}}` objects — 1 635 occurrences across 155 of 246 `.tsx` files.** Tailwind v4 is installed and its Vite plugin is active, but responsive prefixes (`sm:`/`md:`/`lg:`) appear in only 17 files, almost all of them unused vendored shadcn primitives |
| Design tokens | `src/styles/variables.css` (colors, spacing, radius, shadow) and `src/styles/theme.css` (a second, overlapping shadcn token set). **Neither defines breakpoints.** |
| Media queries | Four in feature code, all hand-rolled inside injected `<style>` strings: `lesson.constants.ts` (900/1024/820/640 px), `rich-content-editor.styles.ts` (640), `rich-content.styles.ts` (640), `Empty.css` (768) |
| Runtime breakpoint hook | `src/shared/components/use-mobile.ts` exists (768 px) — **imported by zero feature files** |
| UI kit | A full shadcn/ui set is vendored in `src/shared/components/` — `dialog`, `sheet`, `drawer`, `table`, `sidebar`, `tabs`, `accordion` are imported by **zero** feature files. Features hand-roll their own overlays |
| Tests | Vitest + Testing Library, 20 test files, jsdom. No E2E, no visual regression, no viewport tests |
| CI | `.github/workflows/ci.yml` — `npm ci`, `typecheck`, `test`, `build`, plus a container/Caddy SPA-fallback smoke test. No lint step (deliberate; no ESLint config exists) |

### The systemic root cause

**Inline style objects cannot express a media query.** With ~93 % of the layout expressed
that way, the application has no mechanism for viewport-conditional layout, and there is
no shared breakpoint definition to reference even if it had one. Every responsive fix
made so far has been a local escape hatch — a hand-written CSS string injected through a
`<style>` tag with its own ad-hoc pixel values (900, 1024, 820, 640). That is the pattern
this program must replace with a single shared strategy, not extend.

---

## 2. Screen inventory

24 addressable screens across 8 feature areas, plus ~12 overlay/embedded states.

### Public

| # | Route | Screen | Layout | Owner agent |
| --- | --- | --- | --- | --- |
| 1 | `/` | Landing | `landing-content.tsx` (own navbar/footer) | Landing |
| 2 | `/login` | Login | `AuthLayout` + `BrandPanel` | Auth |
| 3 | `/register` | Register | `AuthLayout` | Auth |
| 4 | `/forgot-password` | Forgot password | `AuthLayout` | Auth |
| 5 | `/otp` | One-time code | `AuthLayout` | Auth |
| 6 | `/reset-password` | Reset password | `AuthLayout` | Auth |
| 7 | `/access-denied` | Access denied | standalone card | Shell |
| 8 | `*` | Not found | standalone | Shell |

### Signed in — all inside `AppLayout`

| # | Route | Screen | `contentWidth` | Owner agent |
| --- | --- | --- | --- | --- |
| 9 | `/profile` | Profile & settings | default | Profile |
| 10 | `/student/courses` | My courses | default | Student Courses |
| 11 | `/student/courses/:id` | Course details (enrolled) | default | Course Details |
| 12 | `/student/courses/:id/lessons/:lid` | Lesson player | `full` | Student Learning |
| 13 | `/student/explore` | Discover courses | default | Discovery |
| 14 | `/student/explore/:id` | Course details (browse) | default | Course Details |
| 15 | `/instructor/home` | Instructor dashboard | default | Instructor Dashboard |
| 16 | `/instructor/courses` | Instructor courses | default | Instructor Courses |
| 17 | `/instructor/courses/:id/overview` | Editor — overview | default | Course Editor |
| 18 | `/instructor/courses/:id/content` | Editor — modules & lessons | default | Modules & Lessons |
| 19 | `/instructor/courses/:id/quizzes` | Editor — quizzes | default | Exams & Quizzes |
| 20 | `/instructor/courses/:id/pricing` | Editor — pricing | default | Pricing & Enrollment |
| 21 | `/instructor/create-course` | Create-course wizard | default | Course Creation |
| 22 | `/instructor/banners` | Banner list | 960 | Banners |
| 23 | `/instructor/banners/new` | Banner create | 960 | Banners |
| 24 | `/instructor/banners/:id` | Banner edit | 960 | Banners |

### Overlay / embedded states (no address of their own)

`checkout-modal`, `submit-confirm-dialog`, `delete-banner-dialog`, `success-overlay`,
`session-loading-screen`, `ErrorOverlay`, and the quiz player's six states
(`quiz-intro`, `quiz-taking`, `quiz-locked`, `passed-result`, `failed-result`,
`previously-passed`) — the last of which mounts in **two** places
(`lesson-form.tsx` and `exam-panel.tsx`).

---

## 3. Findings

Severity: **P0** unusable/blocked · **P1** major defect · **P2** significant UX issue · **P3** polish.

### P0 — the signed-in shell is unusable on a phone

**`src/app/layout/app-layout.tsx` + `src/features/main/components/sidebar.tsx`**

The shell is a flex row with a sidebar of `width: 280, minWidth: 280` that is always
rendered, wrapped in `height: "100vh", overflow: "hidden"`. `<main>` is `flex: 1;
minWidth: 0`, so it — not the sidebar — absorbs every pixel of shortfall. The content
column then adds `padding: "28px 32px 80px"`.

At a 360 px viewport: `360 − 280 = 80 px` for `<main>`, minus 64 px of horizontal
padding = **16 px of usable content width**. The `overflow: hidden` means the result
cannot even be scrolled to. There is no drawer, no hamburger, no breakpoint, and
`use-mobile.ts` is not imported.

**Every one of screens 9–24 inherits this.** It is the single highest-value fix in the
programme and it gates all sixteen signed-in screens.

Related, same file: `height: "100vh"` (not `100dvh`) means mobile browser chrome
overlaps the bottom of the layout; the header is `px-8` with a fixed `height: 64`.

### P0 — the landing navbar's mobile menu button is rendered off-screen

**`src/features/landing/components/landing-navbar.tsx`**, confirmed live.

The nav's inner container is `maxWidth: 1200; padding: 0 28px` with
`justify-content: space-between` and three non-shrinking children. The action group
(`تسجيل الدخول` + `ابدأ الآن` + hamburger) is 272 px wide and does not wrap.

Measured, RTL:

| Viewport | Hamburger button rect | Result |
| --- | --- | --- |
| 375 px | `left: −10 … right: 24` | partially clipped |
| 360 px | `left: −25 … right: 9` | almost entirely clipped |
| 320 px | `left: −65 … right: −31` | **entirely outside the viewport — unreachable** |

At 320 px, 100 separate elements overflow the viewport box.

### P0 — `overflow-x: hidden` is masking that defect

**`src/features/landing/components/landing-content.tsx:24`** —
`<div style={{ fontFamily: FONT, overflowX: "hidden" }}>` wraps the entire landing page.

This is why the page reports `scrollWidth === clientWidth` (`overflowPx: 0`) at 320 px
while the primary navigation control sits 31 px beyond the edge. The diagnostic signal is
suppressed and the content is destroyed rather than scrolled to. **This must be removed,
not relied on** — and it means `scrollWidth > clientWidth` alone is an insufficient gate
for this repo. Per-element bounding-box overflow detection is required.

### P1 — hard two-column grid in the banner form

**`src/features/banner/instructor/banners/components/banner-form.tsx:151`** —
`gridTemplateColumns: "1fr 340px"` with no media query; plus two `"1fr 1fr"` field rows
(lines 328, 382). The route pins `contentWidth: 960`. Below roughly 700 px of content
width the 340 px rail forces overflow.

### P1 — overlays have no mobile presentation and no internal scroll

`checkout-modal.tsx` sizes correctly (`width: 100%; maxWidth: 440` inside a 20 px-padded
`position: fixed; inset: 0` flex-centre) but sets **no `maxHeight` and no internal
scroll**. Content taller than the viewport — which is the normal case once a mobile
keyboard claims half the screen — is clipped at both ends with no way to reach the
submit button. `submit-confirm-dialog`, `delete-banner-dialog` and `success-overlay`
share the pattern. None of the four uses the vendored `dialog`/`drawer`/`sheet`
primitives that already handle this.

### P1 — grid minimums exceed the mobile content box

Six grids use `repeat(auto-fit, minmax(300px, 1fr))` (landing sections) and others use
250/240/230/220/190 px minimums. Inside the signed-in shell's 32 px gutters, a 300 px
minimum overflows any viewport under 364 px, and `auto-fit` cannot rescue it — `minmax()`
does not shrink below its floor. The fix is `minmax(min(300px, 100%), 1fr)`; two files
(`explore-form.tsx`, `explore-skeleton.tsx`) already use exactly that idiom and are the
correct in-repo precedent.

### P1 — the course editor's chrome does not adapt

`course-editor-tabs.tsx` has 32 `display: flex` declarations, a fixed 90 px cover
thumbnail, fixed 38/40/46 px control heights and an action group that does not wrap. The
tab strip does at least use `overflowX: "auto"` (line 267), which is acceptable *here*
because a tab strip is genuinely a horizontal list.

### P1 — fixed heights on media and hero surfaces

`hero-section.tsx` (`height: 260`), `image-upload.tsx` (200/160), `banner-form.tsx`
(140/100), `create-course-banner.tsx` (130), `welcome-banner.tsx` (110),
`course-editor-tabs.tsx` (160/120). Fixed heights with fixed-size children inside a
shrinking box clip content rather than reflow it. These want `aspect-ratio` or
`min-height`.

### P2 — the lesson player's private breakpoint vocabulary

`lesson.constants.ts` is the most responsive-aware file in the repo — and it invents four
breakpoints of its own (900, 1024, 820, 640) with three page-width constants
(`LP_PAGE_MAX` 1120 / `LP_SURFACE_MAX` 940 / `LP_READING_MAX` 780) and a
`margin-inline: -16px` trick to cancel the shell's 32 px gutter. The *reasoning* is
sound and should be preserved; the *values* must be re-expressed against the shared
scale, and the negative-margin hack disappears once the shell has responsive gutters.

### P2 — two competing token systems, neither with breakpoints

`variables.css` and `theme.css` both define color/radius/spacing tokens under different
names. Neither defines a breakpoint scale. Any new breakpoint tokens must land in exactly
one of them.

### P2 — RTL correctness is by literal, not by logic

The app is Arabic-first: `AppLayout` sets `dir="ltr"` on the outer flex row purely to put
the sidebar on the right, then flips `dir="rtl"` back on the header and content children.
Physical properties are used throughout (`paddingRight`/`paddingLeft` pairs in
`sidebar.tsx`, `borderLeft`, `left: 0` on the active indicator, `mr-auto`). This works
today only because the app never renders LTR. Any responsive rework that introduces a
drawer or reorders the shell will break it unless it moves to logical properties
(`padding-inline`, `border-inline-start`, `inset-inline`).

### P2 — touch targets

Sidebar rows are 52 px (fine). But 30/32/38 px controls appear throughout
(`course-editor-tabs.tsx`, `banner-form.tsx`, `checkout-modal.tsx` close button at 32 px),
below the 44 × 44 guidance.

### P3 — `index.html` viewport meta lacks `viewport-fit=cover`; no safe-area insets anywhere.

---

## 4. Verification blocker

There is **no backend on `:8081`**, which the Vite dev server proxies `/api` and
`/uploads` to. Consequences, confirmed live:

- Public routes render and are auditable.
- All six auth screens hang on `جاري التحقق من الجلسة...` for 15 s (the axios timeout)
  before falling through to the form.
- All sixteen signed-in screens are unreachable — `ProtectedRoute` bounces to `/login`.

**16 of 24 screens — including every P0-affected one — cannot currently be visually
verified.** The programme's stated Definition of Done requires visual and interaction
verification, so a deterministic mock API is not optional tooling: it is a prerequisite
for the acceptance gate. It is scheduled as Wave 0.

---

## 5. Severity roll-up

| Severity | Count | Areas |
| --- | --- | --- |
| P0 | 3 | Signed-in shell (gates 16 screens); landing navbar; `overflow-x` masking |
| P1 | 5 | Banner form grid; overlay sizing; grid minimums; editor chrome; fixed heights |
| P2 | 4 | Lesson breakpoint vocabulary; duplicate token systems; RTL physical properties; touch targets |
| P3 | 1 | Viewport meta / safe areas |
