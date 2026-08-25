# Contributing to frontend-foundation

## Branches

```
feature branch ──PR──► develop ──release PR──► main ──tag──► release
```

- **`develop`** is the default branch and where all work lands.
- **`main`** only ever advances through a release PR from `develop`. Nothing is
  developed on it.

Branch names use the prefix that fits: `feat/`, `fix/`, `update/`, then a
kebab-case description — `feat/student-courses`, `fix/re-login-401-after-logout`.

## Commits and pull request titles

```
[Area Emoji] - Sentence case description.
```

Examples from this repository's history:

```
[Student Feature 🧑‍🎓] - Rebuild discover courses as a responsive grid.
[Navigation 🧭] - Make the whole app route-driven and fix navigation defects.
[Frontend Docker 🐳] - Containerise the frontend behind Caddy.
```

Write the body to explain **why**, not what — the diff already says what.

## Setup

```bash
nvm use            # reads .nvmrc — one pinned Node version everywhere
npm ci             # installs strictly from the lockfile
cp .env.example .env
npm run dev
```

`npm ci`, not `npm install`: it fails outright if `package.json` and
`package-lock.json` disagree, which is exactly the regression a bad dependency
change introduces.

The dev server proxies `/api` and `/uploads` to `http://localhost:8081`, so run
the backend locally on that port.

## Before opening a pull request

```bash
npm run typecheck    # tsc --noEmit, strict
npm test             # Vitest
npm run build        # production build
```

CI runs all three plus a container build, and asserts that Caddy serves the SPA
fallback. All must pass before a PR can merge into `develop`.

**Type checking is separate from building on purpose.** Vite strips types
without checking them, so `npm run build` alone will happily emit a bundle from
code that does not type check.

Fill in `.github/PULL_REQUEST_TEMPLATE.md` completely, and **attach before/after
screenshots for any UI change** — desktop and mobile if the screen is
responsive. Mark a section `N/A — <reason>` rather than deleting it.

**Label your PR.** Release notes group merged PRs by label
(`.github/release.yml`); an unlabelled PR lands under "Other Changes".

## Architecture

Feature-based, under `src/features/<name>/`, each with `api/`, `services/`,
`hooks/`, `components/`, `pages/` and `types/`. Cross-feature code goes in
`src/shared/`, routes are registered in `src/app/routes.tsx`, and every request
goes through `src/shared/api/api-client.ts` — no raw `fetch` or `axios` in a
component. Keep business logic in hooks and services, not in pages.

## Environment variables

Only `VITE_`-prefixed variables reach client code, and **Vite inlines them at
build time**. Two consequences:

1. **Nothing secret may ever be a `VITE_` variable** — it ships to the browser
   in plain text.
2. A production image has its values baked in. Changing one means rebuilding.

**Keep `VITE_API_BASE_URL=/api`.** The frontend and backend are same-origin in
every environment, which is what lets the session cookie travel with
`withCredentials` and keeps CSRF working. An absolute cross-origin URL breaks
authentication.

## Dependencies

Dependabot raises updates weekly. Patch-level bumps auto-merge once CI passes;
minor, major and every security update go to a human.
