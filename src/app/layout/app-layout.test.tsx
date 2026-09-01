import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { setViewport, VIEWPORTS } from "@/test/viewport";
import { AppLayout } from "./app-layout";

vi.mock("@/shared/auth", () => ({
  useAuth: () => ({ user: { fullName: "أحمد", email: "a@b.c", role: "STUDENT", requiresPasswordReset: false } }),
  useLogoutAction: () => vi.fn(),
}));

/*
  The shell reads its heading and active section from `useRouteMeta`, which is built on
  `useMatches` and therefore needs a data router. A data router is exactly what this file
  cannot have: every navigation it performs makes react-router build a `Request`, `Request`
  comes from Node's undici because jsdom implements no fetch, and undici rejects the
  `AbortSignal` it is handed — including, as it turns out, the one undici itself produces.
  The brand check is against a reference this environment no longer exposes.

  That surfaced as "Vitest caught 1 unhandled error": every test green, exit code 1. It is
  an incompatibility between this repository's jsdom setup and undici, it has nothing to do
  with the shell, and it would have been silenced rather than fixed by a global handler.

  So the metadata is stubbed and a plain `MemoryRouter` is used. What is under test here is
  which navigation the shell renders at a given width and how the drawer behaves — none of
  which involves route data. Real navigation is verified in a browser.
*/
vi.mock("@/shared/navigation", () => ({
  useRouteMeta: () => ({
    title: "دوراتي",
    subtitle: "متابعة مسيرتك التعليمية",
    section: "student-courses",
    contentWidth: 860,
    transitionKey: "/student/courses",
  }),
}));

const MENU = { name: "فتح القائمة" };

function renderShell(initial = "/student/courses") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="student/courses" element={<p>محتوى الصفحة</p>} />
          <Route path="student/explore" element={<p>الاستكشاف</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

/**
 * What is actually being pinned here is the *decision*, not the geometry.
 *
 * jsdom has no layout engine, so no test in this file can tell you a card overflowed —
 * that is measured in a real browser against the mock API. What it can tell you is which
 * navigation the shell chose to render, which is the thing that silently regresses the
 * moment somebody edits a breakpoint, and the thing that took every signed-in screen
 * below `md` from unusable to usable.
 */
describe("the shell's navigation, by width", () => {
  it("shows the sidebar and no menu button on a desktop", () => {
    setViewport(VIEWPORTS.desktop);
    renderShell();

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.queryByRole("button", MENU)).not.toBeInTheDocument();
  });

  it("keeps the sidebar at the tablet width, where 280px still fits beside content", () => {
    setViewport(VIEWPORTS.tablet);
    renderShell();

    expect(screen.queryByRole("button", MENU)).not.toBeInTheDocument();
  });

  it("replaces it with a menu button on a phone", () => {
    setViewport(VIEWPORTS.phone);
    renderShell();

    // The defect this closes: the 280px sidebar rendered anyway and left 31px for the page.
    expect(screen.getByRole("button", MENU)).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("still renders the page content on the smallest supported phone", () => {
    setViewport(VIEWPORTS.smallPhone);
    renderShell();

    expect(screen.getByText("محتوى الصفحة")).toBeInTheDocument();
  });
});

describe("the drawer", () => {
  it("opens as a modal dialog holding the same navigation", async () => {
    setViewport(VIEWPORTS.phone);
    renderShell();

    await userEvent.click(screen.getByRole("button", MENU));

    const drawer = await screen.findByRole("dialog");
    expect(drawer).toHaveAttribute("aria-modal", "true");
    // Same entries as the desktop sidebar — one navigation, presented two ways.
    expect(screen.getByRole("link", { name: /دوراتي/ })).toBeInTheDocument();
  });

  it("closes when a destination is chosen", async () => {
    setViewport(VIEWPORTS.phone);
    renderShell();

    await userEvent.click(screen.getByRole("button", MENU));
    await screen.findByRole("dialog");

    await userEvent.click(screen.getByRole("link", { name: /استكشاف/ }));

    // Leaving it open over the page just navigated to is the classic drawer bug.
    // `waitFor` because the drawer animates out — asserting immediately catches it
    // mid-transform and reports a pass/fail on the animation rather than on the state.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes on Escape and gives focus back to the button that opened it", async () => {
    setViewport(VIEWPORTS.phone);
    renderShell();

    const button = screen.getByRole("button", MENU);
    await userEvent.click(button);
    await screen.findByRole("dialog");

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(button).toHaveFocus();
  });

  it("reports its state to assistive technology", async () => {
    setViewport(VIEWPORTS.phone);
    renderShell();

    const button = screen.getByRole("button", MENU);
    expect(button).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(button);
    expect(screen.getByRole("button", MENU)).toHaveAttribute("aria-expanded", "true");
  });
});
