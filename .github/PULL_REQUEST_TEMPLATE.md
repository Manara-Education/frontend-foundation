## 📌 Summary

<!-- One or two sentences describing what this PR does and why. -->

## 🎯 Type of Change

<!-- Check all that apply -->

- [ ] New feature (`src/features/<name>/`)
- [ ] New page / sub-flow inside an existing feature
- [ ] Bug fix
- [ ] Refactor (no behavior change)
- [ ] Shared component / design-system update (`src/shared/components/`)
- [ ] API client / shared infra (`src/shared/api/`)
- [ ] Styles / theme (`src/styles/`)
- [ ] Routing (`src/app/routes.tsx`)
- [ ] Tooling / config (Vite, ESLint, TS, package.json)
- [ ] Docs

## 🔗 Related Issues / Tickets

<!-- e.g. Closes #123, Refs #456 -->

## 🧩 Changes

<!-- Bullet list of the concrete changes. Group by feature/layer when helpful. -->

-
-
-

## 📱 Screenshots / Recordings

<!-- For any UI change, attach before/after screenshots or a short clip.
     Include desktop and mobile if the screen is responsive. Delete if N/A. -->

| Before | After |
| ------ | ----- |
|        |       |

## 🏗️ Architecture Checklist

<!-- This project follows a feature-based architecture. Confirm the PR respects it. -->

- [ ] New code lives under the correct layer: `api/`, `services/`, `hooks/`, `components/`, `pages/`, `types/`
- [ ] Cross-feature code is placed in `src/shared/` (not duplicated inside a feature)
- [ ] Routes are registered in `src/app/routes.tsx`
- [ ] API calls go through `src/shared/api/api-client.ts` (no raw `fetch`/`axios` in components)
- [ ] Types are colocated in the feature's `types/` folder
- [ ] No business logic inside page components — kept in hooks/services
