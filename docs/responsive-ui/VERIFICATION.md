# How responsive claims in this programme are verified

Every "clean" claim in these documents comes from one measurement, run in a real browser
against the mock API (`tools/mock-api`). This file records what that measurement does, and —
more usefully — the three ways it was wrong before it was right.

## The question the measurement asks

Not *"is this box inside the viewport rectangle?"* but:

> **Can the user reach this content?**

Those are different questions, and the gap between them is where every false result came from.

## Why not `scrollWidth > clientWidth`

The programme brief proposed
`document.documentElement.scrollWidth > document.documentElement.clientWidth`
as the overflow signal. It is not usable in this repository, and `BASELINE.md` shows why: it
reported a clean bill of health for the **entire signed-in application** while up to 387px of
content sat outside the viewport, because two `overflow: hidden` declarations suppressed the
signal. A page that clips its content instead of scrolling reports zero.

So the gate is per-element geometry: for every rendered element, how far its border box
extends past either viewport edge, via `getBoundingClientRect()`.

## The three corrections

Each of these changed a conclusion. Two of them would have sent an agent to "fix" something
that was already correct.

### 1. SVG internals are not overflow

`<svg>` clips its children to the viewBox by default. A decorative `<circle>` drawn outside
that box is invisible, not overflowing — but its `getBoundingClientRect()` is honest about
where it would be, so it read as a 510px overflow.

**Symptom:** the course-creation wizard appeared to gain a 480px desktop regression at 1280px
that it had never had. The parent `<svg>` was at `left:0 right:461`, entirely inside a 1280px
viewport, with `overflow: hidden` and a viewBox, and the page did not scroll.

**Rule:** skip any element with an `ownerSVGElement`. The `<svg>` itself is still measured — if
*that* overflows, it is real.

### 2. A route that redirected was measured as if it hadn't

`git worktree add` does not copy gitignored files, so the agent worktrees had no `.env`.
`VITE_API_BASE_URL` was undefined, the client called `/v1/auth/me` instead of
`/api/v1/auth/me`, authentication failed, and every gated route redirected to `/login`.

**Symptom:** `/login` is genuinely clean, so it measured as **zero offenders** — a false pass on
every signed-in route. This is the worst of the three, because it produced confident green
results for screens that were never rendered.

**Rule:** the probe asserts `document.location.pathname` matches the route requested, and
discards the measurement as `INVALID` otherwise. A redirect can no longer masquerade as a pass.

### 3. Deliberate horizontal scroll is not a defect

The course editor's tab strip is `overflow-x: auto` with `scrollWidth 460 > clientWidth 343`.
Its fourth tab sits outside the viewport rectangle and is reached by scrolling the strip —
which is what a tab strip is for, and what `RESPONSIVE_AUDIT.md` already called legitimate.

**Symptom:** a "99px offender" at 375px that was the pricing tab, correctly parked off-screen.
An agent told to eliminate it might have removed the scroll and made four tabs genuinely
unreachable.

**Rule:** skip an element if any ancestor has `overflow-x: auto|scroll` **and** can actually
scroll (`scrollWidth > clientWidth`). Deliberate scroll regions should carry `.rs-scroll-x`,
so a reviewer can grep the intentional ones.

## What is still counted, on purpose

**Content clipped by `overflow: hidden`.** That is not a false positive — it is the defect this
programme exists to find. Content clipped that way is unreachable by any means, and the
clipping is precisely what hides it from the naive diagnostic. It must stay a failure.

## The rule, stated once

An element fails if its border box extends past a viewport edge **and** it is not
(a) inside an `<svg>`, or (b) inside an ancestor that scrolls horizontally on purpose.
The measurement is taken only after two consecutive readings agree, so a skeleton caught
mid-shimmer is not reported as a defect — that produced a phantom failure too.

## Standing caveat

The instrument has been the least reliable part of this programme: three corrections, each
found by chasing a result that looked wrong. A number in these documents is a claim about
what the probe saw, and the probe is only as good as its current exclusion list. Treat a
surprising green with the same suspicion as a surprising red — that is how all three of these
were found.
