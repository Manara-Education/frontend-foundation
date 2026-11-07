<a id="readme-top"></a>

<div align="center">

<img src="public/favicon.svg" alt="Manara logo" width="80" height="80">

<h1>Manara · Frontend</h1>

<p><strong>The part of Manara you can see and click: an online school where teachers share courses and students learn.</strong></p>

<p>
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="MUI">
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

<p>
  <a href="https://github.com/Manara-Education/backend-foundation"><strong>See the backend »</strong></a>
  ·
  <a href="https://github.com/Manara-Education/frontend-foundation/issues">Report a bug</a>
  ·
  <a href="https://github.com/Manara-Education/frontend-foundation/issues">Request a feature</a>
</p>

</div>

<details>
  <summary><strong>📑 Table of contents</strong></summary>
  <ol>
    <li><a href="#-explain-it-like-im-5">Explain it like I'm 5</a></li>
    <li><a href="#-about-the-project">About the project</a></li>
    <li><a href="#-getting-started">Getting started</a></li>
    <li><a href="#-usage">Usage</a></li>
    <li><a href="#-project-structure">Project structure</a></li>
    <li><a href="#-how-login-works-developer-notes">How login works (developer notes)</a></li>
    <li><a href="#-contributing">Contributing</a></li>
    <li><a href="#-security">Security</a></li>
    <li><a href="#-team">Team</a></li>
    <li><a href="#-acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

---

## 🧸 Explain it like I'm 5

**Manara** (منارة) means **lighthouse**: a light that shows you the way. 💡

Manara is a **school on the internet**:

- 👩‍🏫 **Teachers** make courses with videos, lessons and quizzes.
- 🧑‍🎓 **Students** join a course, watch the lessons, take the quizzes and see how far they've got.

Think of a restaurant. 🍽️

| In a restaurant | In Manara |
|---|---|
| 🪑 The **dining room**, where you sit, read the menu and order | **This repo, the frontend**: the website you see, click and type into |
| 👨‍🍳 The **kitchen**, which cooks the food you ordered | The **backend** ([its own repo](https://github.com/Manara-Education/backend-foundation)), which does the work and remembers everything |

When you click a button, the dining room writes your order on a slip and passes it to the kitchen. The kitchen sends the food back, and the dining room puts it on your table. 🍲

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 💡 About the project

A **React 19 + TypeScript** single-page app, built with **Vite**.

### ✨ What you can do

**🌍 Everyone**
- Visit the landing page, About, Contact, Security, Terms and Privacy pages
- Explore the public course catalog and open any course to see what's inside
- Sign up, verify your email with a one-time code, log in, and reset a forgotten password

**🧑‍🎓 Students**
- See your courses and open one to watch its lessons
- Take quizzes and track your progress
- Explore more courses and join them

**👩‍🏫 Instructors**
- A home dashboard
- Create a course, then edit it in four tabs: Overview, Content, Quizzes and Pricing
- Create and manage promotional banners

**👤 Everyone who is logged in**
- A profile page

### 🌟 Nice details

- 📱 **Responsive**: works on phones, tablets and desktops
- ↔️ **Both directions**: layouts work left-to-right and right-to-left
- ✍️ **Rich text** for course content, powered by Tiptap
- 🎬 **Video lessons** from YouTube and Vimeo

### 🧰 Built with

| Tool | What it does here |
|---|---|
| [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | The UI and the language it's written in |
| [Vite](https://vite.dev/) | Runs the dev server and builds the app very fast |
| [Tailwind CSS](https://tailwindcss.com/), [MUI](https://mui.com/) and [Radix UI](https://www.radix-ui.com/) | Styling and ready-made components |
| [React Router](https://reactrouter.com/) | Moves between pages without reloading |
| [Axios](https://axios-http.com/) | Talks to the backend |
| [Tiptap](https://tiptap.dev/) | The rich text editor |
| [Vitest](https://vitest.dev/) | Runs the tests |
| [Docker](https://www.docker.com/) + [Caddy](https://caddyserver.com/) | Packages and serves the built website |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🚀 Getting started

### Prerequisites

- [Node.js 24](https://nodejs.org/) (see [`.nvmrc`](.nvmrc))

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/Manara-Education/frontend-foundation.git
   cd frontend-foundation
   ```
2. **Install the packages** (`npm ci` installs exactly what's in the lockfile)
   ```sh
   npm ci
   ```
3. **Start it.** Pick one:

   **🅰️ Easy mode, no backend needed.** A small fake backend answers with sample data, so you can click around:
   ```sh
   npm run dev:mock
   ```
   Want to see the instructor screens? Switch the fake user's role:
   ```sh
   curl 'localhost:8081/api/__mock/role?as=instructor'
   ```

   **🅱️ Real mode.** First start the [backend](https://github.com/Manara-Education/backend-foundation) on port `8081`, then:
   ```sh
   npm run dev
   ```
4. **Open** <http://localhost:5173> 🎉

> [!NOTE]
> The dev server sends every `/api` and `/uploads` request to `http://localhost:8081`, which is where the backend (or the fake one) listens.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🧪 Usage

| Command | What it does |
|---|---|
| `npm run dev` | Starts the website on <http://localhost:5173> |
| `npm run dev:mock` | Starts the website plus a fake backend with sample data |
| `npm run typecheck` | Checks all the TypeScript types (strict) |
| `npm test` | Runs the tests once |
| `npm run test:watch` | Re-runs the tests every time you save |
| `npm run build` | Builds the production website into `dist/` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🗂️ Project structure

```text
src/
├── app/          🧭 Routes, page layout and app-level screens
├── features/     🧩 One folder per feature
│   ├── landing/        🏠 The home page
│   ├── public-courses/ 🔎 The public course catalog
│   ├── auth/           🔐 Sign up, login, email code, password reset
│   ├── course/         📚 Courses
│   ├── lesson/         📖 Lessons
│   ├── quiz/           📝 Quizzes
│   ├── instructor/     👩‍🏫 Instructor screens
│   ├── banner/         🖼️ Promotional banners
│   ├── profile/        👤 Your profile
│   ├── about/  contact/  legal/   ℹ️ Info pages
│   └── …
├── shared/       🧰 Code every feature uses: API client, auth, components,
│                    video, rich text, responsive and direction helpers
└── styles/       🎨 Theme, fonts and global CSS
tools/mock-api/   🎭 The fake backend for easy mode
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🛡️ Security

Found a security problem? **Please don't open a public issue.** Follow **[SECURITY.md](SECURITY.md)** instead.

---

