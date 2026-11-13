import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createBrowserRouter, RouterProvider, useLocation } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { AboutPage } from "@/features/about/pages/about-page";
import { LandingFooter } from "./landing-footer";
import { PublicHeader } from "./public-header";
import { PublicBreadcrumb } from "./public-breadcrumb";

/*
  The public site's history behaviour, driven the way a visitor moves through it: in from the
  landing page, around the secondary pages, then home again via the chrome each of those pages
  carries.

  Leaving the landing page pushes, so Back returns to it. Everything after that replaces, so the
  visitor is never more than one entry deep in the public site: going home, or pressing Back
  from anywhere in it, lands on the landing page — never on a page they have already closed, and
  never straight out of the site.

  These run on a real browser router rather than a memory one, because the behaviour under test
  is the session history itself.
*/

function Landing() {
  const location = useLocation();
  return <p data-testid="at">{`landing ${location.pathname}`}</p>;
}

function Secondary({ name }: { name: string }) {
  return (
    <>
      <PublicHeader />
      <PublicBreadcrumb current={name} />
      <p data-testid="at">{name}</p>
    </>
  );
}

function build() {
  const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "/about", element: <Secondary name="about" /> },
    { path: "/contact", element: <Secondary name="contact" /> },
    { path: "/privacy", element: <Secondary name="privacy" /> },
  ]);
  render(<RouterProvider router={router} />);
  return router;
}

const at = () => screen.getByTestId("at").textContent;

/** The browser's own Back button, which is what the visitor actually presses. */
async function pressBack() {
  await act(async () => {
    window.history.back();
    // jsdom applies the traversal on a later task, and the router reacts to `popstate`.
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

/** Leaving the landing page: a push, so the landing entry stays underneath. */
async function leaveLandingFor(router: ReturnType<typeof build>, path: string) {
  await act(async () => {
    await router.navigate(path);
  });
}

function clickIn(navLabel: string, linkName: string) {
  return userEvent.click(
    within(screen.getByRole("navigation", { name: navLabel })).getByRole("link", { name: linkName }),
  );
}

describe("returning to the landing page", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("goes home without leaving the closed page behind for Back", async () => {
    const router = build();
    await leaveLandingFor(router, "/about");
    expect(at()).toBe("about");

    await clickIn("مسار التنقل", "الرئيسية");
    expect(at()).toBe("landing /");

    await pressBack();
    expect(at()).toBe("landing /");
  });

  it("keeps Back on the landing page rather than out of the site", async () => {
    const router = build();
    await leaveLandingFor(router, "/about");
    await clickIn("روابط الموقع", "الرئيسية");

    await pressBack();
    expect(at()).toBe("landing /");
  });

  it("stays one entry deep however many public pages the visitor tours", async () => {
    const router = build();
    await leaveLandingFor(router, "/about");

    // Moving sideways through the site replaces, so none of these pile up.
    await clickIn("روابط الموقع", "تواصل معنا");
    expect(at()).toBe("contact");
    await clickIn("روابط الموقع", "عن منارة");
    expect(at()).toBe("about");

    await pressBack();
    expect(at()).toBe("landing /");
  });

  it("returns to the landing page from a tour even without using a home control", async () => {
    const router = build();
    await leaveLandingFor(router, "/about");
    await clickIn("روابط الموقع", "تواصل معنا");

    await pressBack();
    expect(at()).toBe("landing /");
  });
});

/*
  The same journey again, but driven the way the visitor actually drives it: the real About page,
  and the real footer on the landing page, clicked rather than navigated to. The tests above
  reach /about with `router.navigate`, which pushes whatever the links do — so on their own they
  would not notice if the footer stopped pushing, or the About page's own chrome stopped
  replacing.
*/
describe("the real journey out of the landing page and back", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  function buildReal() {
    const router = createBrowserRouter([
      // The landing page's footer is the thing the visitor clicks to leave.
      { path: "/", element: <><p data-testid="at">landing /</p><LandingFooter /></> },
      { path: "/about", element: <AboutPage /> },
    ]);
    render(<RouterProvider router={router} />);
    return router;
  }

  it("footer → About → الرئيسية → Back stays on the landing page", async () => {
    buildReal();
    expect(at()).toBe("landing /");

    await clickIn("اكتشف منارة", "عن منارة");
    expect(screen.getByRole("heading", { name: "عن منارة", level: 1 })).toBeInTheDocument();

    await clickIn("مسار التنقل", "الرئيسية");
    expect(at()).toBe("landing /");

    await pressBack();
    expect(at()).toBe("landing /");
  });

  it("Back straight from About returns to the landing page", async () => {
    buildReal();
    await clickIn("اكتشف منارة", "عن منارة");

    await pressBack();
    expect(at()).toBe("landing /");
  });
});
