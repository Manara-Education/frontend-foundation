import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { setViewport, VIEWPORTS } from "@/test/viewport";
import { BREAKPOINTS, down, up } from "./breakpoints";
import { useBreakpointUp, useIsMobile } from "./use-media-query";

function Probe() {
  const isMobile = useIsMobile();
  const isDesktop = useBreakpointUp("lg");
  return <span data-testid="probe">{`${isMobile ? "mobile" : "not-mobile"}/${isDesktop ? "lg" : "not-lg"}`}</span>;
}

const read = () => screen.getByTestId("probe").textContent;

describe("breakpoint queries", () => {
  it("does not let up() and down() both match at the boundary", () => {
    // The bug this guards: `max-width: 768px` and `min-width: 768px` both match at exactly
    // 768, so a shell keyed to them renders the sidebar *and* the drawer.
    setViewport(BREAKPOINTS.md);
    expect(window.matchMedia(up("md")).matches).toBe(true);
    expect(window.matchMedia(down("md")).matches).toBe(false);
  });

  it("does not let a fractional width fall between them", () => {
    // Zoom and some devices really do report 767.5px. Subtracting a whole pixel from the
    // max-width would leave this matching neither query.
    setViewport(BREAKPOINTS.md - 0.5);
    expect(window.matchMedia(down("md")).matches).toBe(true);
    expect(window.matchMedia(up("md")).matches).toBe(false);
  });
});

describe("useMediaQuery", () => {
  it("reports the right answer on the very first render, with no flash", () => {
    // The failure this replaces: the effect-based hook returns the desktop answer first
    // and corrects itself afterwards, so a phone paints the desktop layout once.
    setViewport(VIEWPORTS.phone);
    render(<Probe />);
    expect(read()).toBe("mobile/not-lg");
  });

  it("reports desktop at desktop widths", () => {
    setViewport(VIEWPORTS.desktop);
    render(<Probe />);
    expect(read()).toBe("not-mobile/lg");
  });

  it("treats the tablet width as not-mobile", () => {
    // 768 is `md`, and `md` and up is where the sidebar fits beside the content.
    setViewport(VIEWPORTS.tablet);
    render(<Probe />);
    expect(read()).toBe("not-mobile/not-lg");
  });
});
