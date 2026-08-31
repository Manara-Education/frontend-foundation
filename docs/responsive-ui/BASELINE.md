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
