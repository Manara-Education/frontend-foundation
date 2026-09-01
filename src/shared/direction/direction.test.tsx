import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  DirectionProvider,
  inlineAxisSign,
  offscreenInlineStart,
  readDocumentDirection,
  toLayoutDirection,
  towardInlineEnd,
  useDirection,
} from ".";

/**
 * The direction primitive, tested as the thing the navigation shell actually asks it.
 *
 * There is no layout engine here, so none of this can tell you a drawer looked right. What
 * it pins is the decision every direction-sensitive rule in the shell is derived from — and
 * in particular the *sign*, which is the part that was wrong: a drawer told to slide
 * `+100%` slides right in Arabic and right in English, and only one of those is "in from
 * the side the navigation lives on".
 */

const originalDir = document.documentElement.getAttribute("dir");

afterEach(() => {
  if (originalDir === null) document.documentElement.removeAttribute("dir");
  else document.documentElement.setAttribute("dir", originalDir);
});

describe("reading a direction", () => {
  it("accepts the two directions a layout can have, in any casing", () => {
    expect(toLayoutDirection("rtl")).toBe("rtl");
    expect(toLayoutDirection("LTR")).toBe("ltr");
    expect(toLayoutDirection("  rtl  ")).toBe("rtl");
  });

  it("refuses to guess at anything else", () => {
    // `auto` is a real, legal `dir` — and it is not an answer to "which side is start".
    expect(toLayoutDirection("auto")).toBeNull();
    expect(toLayoutDirection("")).toBeNull();
    expect(toLayoutDirection(null)).toBeNull();
    expect(toLayoutDirection("sideways")).toBeNull();
  });

  it("takes the document at its word", () => {
    document.documentElement.setAttribute("dir", "ltr");
    expect(readDocumentDirection()).toBe("ltr");
    document.documentElement.setAttribute("dir", "rtl");
    expect(readDocumentDirection()).toBe("rtl");
  });

  it("falls back to RTL, because that is what this application ships as", () => {
    // `index.html` is `<html lang="ar" dir="rtl">`. An absent `dir` means nobody said,
    // and defaulting to LTR there would flip the navigation to the wrong side on load.
    document.documentElement.removeAttribute("dir");
    expect(readDocumentDirection()).toBe("rtl");
    document.documentElement.setAttribute("dir", "auto");
    expect(readDocumentDirection()).toBe("rtl");
  });
});

describe("turning a direction into the physical values CSS cannot express", () => {
  it("knows which way the inline axis runs", () => {
    expect(inlineAxisSign("ltr")).toBe(1);
    expect(inlineAxisSign("rtl")).toBe(-1);
  });

  it("measures a distance towards inline-end as a signed X", () => {
    expect(towardInlineEnd("ltr", 4)).toBe(4);
    expect(towardInlineEnd("rtl", 4)).toBe(-4);
  });

  /*
    The regression this file exists for. A drawer resting against the inline-start edge is
    off-screen in *opposite* directions in the two layouts, and `translateX` has no logical
    form that would work this out on its own.
  */
  it("puts a drawer off-screen past the edge it is anchored to", () => {
    expect(offscreenInlineStart("rtl")).toBe("100%");
    expect(offscreenInlineStart("ltr")).toBe("-100%");
  });

  it("never returns the same sign for both directions", () => {
    expect(offscreenInlineStart("rtl")).not.toBe(offscreenInlineStart("ltr"));
  });
});

function Probe() {
  return <span data-testid="direction">{useDirection()}</span>;
}

describe("the direction a subtree lays out in", () => {
  it("is the document's, when nothing has overridden it", () => {
    document.documentElement.setAttribute("dir", "rtl");
    render(<Probe />);
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");
  });

  it("is the provider's, when one is present", () => {
    // The document still says RTL. A provider is how a test — or an LTR subtree — says
    // otherwise without touching the document.
    document.documentElement.setAttribute("dir", "rtl");
    render(
      <DirectionProvider direction="ltr">
        <Probe />
      </DirectionProvider>,
    );
    expect(screen.getByTestId("direction")).toHaveTextContent("ltr");
  });

  it("follows the document changing underneath it", async () => {
    document.documentElement.setAttribute("dir", "rtl");
    render(<Probe />);
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");

    // `act`, because the update arrives from a MutationObserver rather than from an event
    // React already knows about.
    await act(async () => {
      document.documentElement.setAttribute("dir", "ltr");
    });

    // Read during render rather than corrected in an effect, so a shell that mounts while
    // the document is RTL and is switched to LTR does not animate from the stale edge once.
    await waitFor(() => expect(screen.getByTestId("direction")).toHaveTextContent("ltr"));
  });
});
