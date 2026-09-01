# Mock API — responsive verification harness

Sixteen of Manara's twenty-four screens sit behind `ProtectedRoute`, and the Vite dev
server proxies `/api` to `:8081`. With nothing listening there they redirect to `/login`,
so the responsive Definition of Done's "visual verification completed" cannot be
performed on any of them — including every screen affected by the P0 shell defect.

This is a zero-dependency stand-in that makes those screens reachable. It is **not** a
backend and makes no claim about how the real server behaves. It exists so a layout can
be looked at.

```bash
npm run dev:mock        # mock API on :8081 + Vite on :5173
npm run mock-api        # the mock alone
```

Switch the signed-in role (both areas are worth auditing):

```bash
curl 'localhost:8081/api/__mock/role?as=instructor'
curl 'localhost:8081/api/__mock/role?as=student'
```

## Why the fixtures look like that

`fixtures.mjs` is deliberately adversarial, because a layout verified against short,
tidy strings has not been verified:

| Fixture | Catches |
| --- | --- |
| `LONG_AR_TITLE` — 100 chars of Arabic | titles that clip instead of wrapping |
| `UNBREAKABLE` — 32 chars, no spaces | missing `overflow-wrap: anywhere` |
| `LONG_URL` — 97 chars of Latin | containers that do not break long tokens |
| `null` subtitle/image/description beside populated ones | both branches of every optional field |
| 6 courses, 5 lessons, 2 modules, 3 subscription plans | grids that actually have to reflow |

Shapes mirror `src/shared/courses/courses.types.ts`. When a contract changes, this
changes with it — a mock that has drifted from the contract verifies nothing.
