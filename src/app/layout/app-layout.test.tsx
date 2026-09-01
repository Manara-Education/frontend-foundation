import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { DirectionProvider } from "@/shared/direction";
import type { LayoutDirection } from "@/shared/direction";
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

/** The same shell, told which way round it is laying out. */
function renderShellIn(direction: LayoutDirection, width: number) {
  setViewport(width);
  return render(
    <DirectionProvider direction={direction}>
      <MemoryRouter initialEntries={["/student/courses"]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="student/courses" element={<p>محتوى الصفحة</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </DirectionProvider>,
  );
}

/** The flex row that holds the navigation and the page, in DOM order. */
function shellRow(): HTMLElement {
  const row = document.querySelector("main")?.parentElement;
  if (!row) throw new Error("the shell did not render");
  return row;
}

/** The signed `translateX(…)` motion has put on an element, in percent. */
function translateXPercent(element: HTMLElement): number {
  const match = /translateX\(([-\d.]+)%\)/.exec(element.style.transform);
  if (!match) throw new Error(`no translateX on: ${element.style.transform || "(none)"}`);
  return Number(match[1]);
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


/**
 * Which side the navigation is on — the defect this file was extended for.
 *
 * The shell had two answers. Above `md` the column came first in a `dir`-ordered flex row,
 * so it landed on the right in Arabic and would land on the left in English: correct, and
 * correct for the right reason. Below `md` the drawer was anchored with
 * `inset-inline-end: 0` — which in RTL *is the left* — and animated with a literal
 * `x: "100%"`, which is rightwards in both directions because transforms are physical. So
 * the button sat on the right and the navigation arrived on the left.
 *
 * jsdom lays nothing out, so none of these assert a position. They assert the *instruction*:
 * which edge the drawer is anchored to, which way its transform points, and what order the
 * row is in. Those are the three things that were disagreeing, and they are what silently
 * regresses the next time somebody reaches for `left` because the design is Arabic.
 *
 * Geometry is verified in a browser at 320–1440px, both directions — see
 * `docs/responsive-ui/VERIFICATION.md`.
 */
describe("which side the navigation is on", () => {
  it("puts the direction on the DOM, so logical properties have something to resolve against", () => {
    renderShellIn("ltr", VIEWPORTS.desktop);
    expect(shellRow()).toHaveAttribute("dir", "ltr");
  });

  it.each([
    ["rtl", VIEWPORTS.desktop],
    ["ltr", VIEWPORTS.desktop],
    ["rtl", VIEWPORTS.tablet],
    ["ltr", VIEWPORTS.tablet],
  ] as const)("gives the sidebar the start column in %s at %ipx", (direction, width) => {
    renderShellIn(direction, width);

    // Navigation first in a flex row that reads in `dir` order *is* "the start edge" —
    // right in RTL, left in LTR — with no offset arithmetic on the content beside it.
    const [first, second] = shellRow().children;
    expect(first.tagName).toBe("ASIDE");
    expect(second.tagName).toBe("MAIN");

    // The content is a sibling that takes what is left, not a block pushed over by a
    // hard-coded `margin-left: 280px`.
    const main = second as HTMLElement;
    expect(main.style.marginLeft).toBe("");
    expect(main.style.marginRight).toBe("");
    expect(main.style.paddingLeft).toBe("");
    expect(main.style.paddingRight).toBe("");
  });

  it.each(["rtl", "ltr"] as const)("anchors the drawer to the start edge in %s", async (direction) => {
    renderShellIn(direction, VIEWPORTS.phone);
    await userEvent.click(screen.getByRole("button", MENU));
    const drawer = await screen.findByRole("dialog");

    // The whole bug in one assertion: `inset-inline-end` here is the left in Arabic.
    expect(drawer.style.insetInlineStart).toMatch(/^0(px)?$/);
    expect(drawer.style.insetInlineEnd).toBe("");
    expect(drawer.style.left).toBe("");
    expect(drawer.style.right).toBe("");
  });

  it("slides the drawer in from the right in RTL", async () => {
    renderShellIn("rtl", VIEWPORTS.phone);
    await userEvent.click(screen.getByRole("button", MENU));
    const drawer = await screen.findByRole("dialog");

    // Positive is rightwards. It may be anywhere in (0, 100] depending on how far the
    // animation has run — what must never happen is a negative one, which would be the
    // drawer coming in over the content from the far side.
    expect(translateXPercent(drawer)).toBeGreaterThanOrEqual(0);
  });

  it("slides the drawer in from the left in LTR", async () => {
    renderShellIn("ltr", VIEWPORTS.phone);
    await userEvent.click(screen.getByRole("button", MENU));
    const drawer = await screen.findByRole("dialog");

    // The assertion a hard-coded `x: "100%"` cannot pass.
    expect(translateXPercent(drawer)).toBeLessThanOrEqual(0);
  });

  it.each(["rtl", "ltr"] as const)("keeps the drawer inside the viewport in %s", async (direction) => {
    renderShellIn(direction, VIEWPORTS.smallPhone);
    await userEvent.click(screen.getByRole("button", MENU));
    const drawer = await screen.findByRole("dialog");

    // jsdom cannot measure, so this pins the instruction that makes the measurement come
    // out right: the panel is capped against the viewport, and the sidebar inside it fills
    // that cap rather than insisting on its own 280px and hanging off the edge.
    expect(drawer.style.inlineSize).toBe("min(280px, 88vw)");
    expect(drawer.querySelector("aside")).toHaveStyle({ inlineSize: "100%" });
  });

  it("keeps the trigger and the drawer on the same edge", async () => {
    renderShellIn("rtl", VIEWPORTS.phone);
    const button = screen.getByRole("button", MENU);

    // The button is the first thing in the header, which in a `dir`-ordered flex row is the
    // start edge — the same edge `inset-inline-start` anchors the drawer to. Fixing one
    // without the other is how the two came to disagree in the first place.
    expect(button.parentElement?.firstElementChild).toBe(button);
    expect(button.style.marginInlineStart).toBe("-10px");

    await userEvent.click(button);
    expect((await screen.findByRole("dialog")).style.insetInlineStart).toMatch(/^0(px)?$/);
  });
});
