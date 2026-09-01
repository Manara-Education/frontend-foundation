# Responsive baseline — measured before any fix

**Commit:** `cc1dd81` (`origin/develop`) · **Date:** 2026-08-31
**Method:** each route loaded in a same-origin iframe at a fixed width against the mock API
(`tools/mock-api`). For every rendered element, the largest distance its border box extends
past the viewport edge. `scrollOv` is `documentElement.scrollWidth − clientWidth`, recorded
alongside for comparison.

`worst` = pixels of content rendered outside the viewport. `n` = number of elements affected.

| Route | 320 px | 375 px | 768 px | `scrollOv` (all widths) |
| --- | --- | --- | --- | --- |
| `/` | **65** (n=100) | **10** (n=3) | 0 | 0 |
| `/login` | 0 | 0 | 0 | 0 |
| `/register` | 0 | 0 | 0 | 0 |
| `/forgot-password` | 0 | 0 | 0 | 0 |
| `/student/courses` | **232** (n=168) | **177** (n=126) | 0 | 0 |
| `/student/courses/1` | **197** (n=194) | **142** (n=103) | 0 | 0 |
| `/student/courses/1/lessons/103` | **95** (n=65) | **40** (n=19) | 0 | 0 |
| `/student/explore` | **179** (n=58) | **124** (n=10) | 0 | 0 |
| `/profile` | **387** (n=45) | **313** (n=22) | 0 | 0 |

## The single most important row in this table

**`scrollOv` is `0` everywhere.**

The diagnostic named in the programme brief —
`document.documentElement.scrollWidth > document.documentElement.clientWidth` — reports a
completely clean bill of health for the entire signed-in application while up to 387 px of
content is rendered outside the viewport and cannot be reached by any means.

Two separate `overflow` declarations cause this:

- `src/app/layout/app-layout.tsx:47` — `overflow: "hidden"` on the shell's flex row
- `src/features/landing/components/landing-content.tsx:24` — `overflowX: "hidden"` on the landing page

Neither was written to hide a defect; both nonetheless do. **The programme therefore gates
on per-element bounding-box overflow, not on `scrollWidth`.** Removing the two `overflow`
declarations is part of the fix, not a prerequisite for measuring — the measurement above
already sees past them.

## Reading the pattern

Every signed-in route is clean at 768 px and broken below it. That is the shell's
arithmetic, not sixteen separate feature bugs: a 280 px non-shrinking sidebar plus 64 px of
gutters leaves `768 − 344 = 424 px` of content (survivable) and `375 − 344 = 31 px`
(not). Fixing the shell is expected to clear the bulk of every row in this table; whatever
survives is the feature's own defect, which is what the feature workstreams then own.

`/profile` is worst because its content is widest relative to its container; `/login` and
`/register` are clean because auth does not use the shell — it has its own layout, already
made responsive in PR #53.

---

# After the shell fix (`fix/responsive-shell`)

Same method, same widths. `worst` = pixels of content rendered outside the viewport.

## Student area — 20 / 20 clean

| Route | 320 | 375 | 768 | 1280 |
| --- | --- | --- | --- | --- |
| `/student/courses` | 232 → **0** | 177 → **0** | 0 | 0 |
| `/student/courses/1` | 197 → **0** | 142 → **0** | 0 | 0 |
| `/student/courses/1/lessons/103` | 95 → **0** | 40 → **0** | 0 | 0 |
| `/student/explore` | 179 → **0** | 124 → **0** | 0 | 0 |
| `/profile` | 387 → **0** | 313 → **0** | 0 | 0 |

## Instructor area — 8 / 20 clean, 12 rows remaining

These are what the shell fix does **not** reach, and they are the feature workstreams'
scope rather than the shell's:

| Route | 320 | 375 | 768 | 1280 | Owner |
| --- | --- | --- | --- | --- | --- |
| `/instructor/home` | 327 | 275 | 280 | **85** | Instructor Dashboard |
| `/instructor/courses` | 0 | 0 | 0 | 0 | — clean |
| `/instructor/courses/1/content` | 154 | 99 | 0 | 0 | Course Editor |
| `/instructor/create-course` | 253 | 198 | 100 | 0 | Course Creation |
| `/instructor/banners` | 178 | 123 | 25 | 0 | Banners |

`/instructor/home` is the notable one: it overflows at **1280px** as well, so it carries a
pre-existing desktop defect that has nothing to do with viewport width and would not have
been found by looking at phones. `/instructor/banners` is the `gridTemplateColumns:
"1fr 340px"` predicted in the audit.

## What this says about the sequencing

The shell was one defect wearing sixteen masks. Fixing it cleared 28 of 40 measured rows,
including every student screen, without a single feature file being touched — which is the
case for having done the foundation and the shell before letting thirteen feature agents
loose on the same symptoms. Had they run first, most of them would have written a local
workaround for a defect that was never theirs.
