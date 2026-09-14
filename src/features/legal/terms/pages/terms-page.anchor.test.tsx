import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, Link, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentTermsRequest } from "../api/terms.api";
import { sectionIdFromHash } from "../hooks/use-section-anchor";
import { TermsPage } from "./terms-page";

/*
  Deep links into the terms — above all `/terms#section-6`, the refund clause the footer
  links to — against a document that arrives asynchronously.

  jsdom does not lay anything out, so these tests cannot prove the viewport moved; the
  browser check in the pull request does that. What they pin down is *when* and *where* a
  scroll is asked for: only after the section exists, only to a section the document has,
  exactly once per navigation, and never again for a re-render or a retry.
*/
vi.mock("../api/terms.api", () => ({
  getCurrentTermsRequest: vi.fn(),
}));

const requestMock = vi.mocked(getCurrentTermsRequest);

type TermsResponse = Awaited<ReturnType<typeof getCurrentTermsRequest>>;

const CURRENT = {
  status: 200,
  data: { status: "success", data: { version: "1.0", effectiveDate: "2026-09-07" } },
} as TermsResponse;

/** A response the test releases when it chooses: the terms arriving "later". */
function respondLater() {
  let resolve!: (value: TermsResponse) => void;
  requestMock.mockReturnValueOnce(new Promise<TermsResponse>((r) => (resolve = r)));
  return async () => {
    await act(async () => resolve(CURRENT));
  };
}

/** Lets pending animation frames and effects run, so "nothing happened" is a real observation. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

let scrolledTo: string[];

beforeEach(() => {
  scrolledTo = [];
  vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(function (this: Element) {
    scrolledTo.push(this.id);
  });
  requestMock.mockResolvedValue(CURRENT);
});

afterEach(() => {
  vi.restoreAllMocks();
  requestMock.mockReset();
});

function renderAt(...entries: string[]) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <Link to="/terms#section-6">سياسة الإلغاء والاسترداد</Link> },
      { path: "/terms", element: <TermsPage /> },
    ],
    { initialEntries: entries, initialIndex: entries.length - 1 },
  );
  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}

describe("opening a deep link", () => {
  it("scrolls to the refund section only once the terms have rendered", async () => {
    const release = respondLater();
    renderAt("/terms#section-6");

    await settle();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(scrolledTo).toEqual([]);

    await release();

    await waitFor(() => expect(scrolledTo).toEqual(["section-6"]));
    expect(document.getElementById("section-6")).toHaveTextContent("الإلغاء والاسترداد");
  });

  it("moves keyboard focus to the section without adding it to the tab order", async () => {
    renderAt("/terms#section-6");

    await waitFor(() => expect(scrolledTo).toEqual(["section-6"]));
    const section = document.getElementById("section-6");
    expect(document.activeElement).toBe(section);
    expect(section).toHaveAttribute("tabindex", "-1");
  });

  it("does the same on a reload, which mounts the page afresh", async () => {
    const first = renderAt("/terms#section-6");
    await waitFor(() => expect(scrolledTo).toEqual(["section-6"]));
    first.unmount();

    renderAt("/terms#section-6");

    await waitFor(() => expect(scrolledTo).toEqual(["section-6", "section-6"]));
  });

  it("lands on the section after a failed load is retried", async () => {
    requestMock.mockRejectedValueOnce(new Error("network"));
    renderAt("/terms#section-6");

    fireEvent.click(await screen.findByRole("button", { name: "إعادة المحاولة" }));

    await waitFor(() => expect(scrolledTo).toEqual(["section-6"]));
  });

  it("does nothing without a fragment", async () => {
    renderAt("/terms");

    await screen.findByRole("article");
    await settle();
    expect(scrolledTo).toEqual([]);
  });
});

describe("after the reader has been taken there", () => {
  it("does not jump again when the page re-renders", async () => {
    const { router, rerender } = renderAt("/terms#section-6");
    await waitFor(() => expect(scrolledTo).toEqual(["section-6"]));

    rerender(<RouterProvider router={router} />);
    await settle();

    expect(scrolledTo).toEqual(["section-6"]);
  });

  it("follows a link to another section, and back and forward through history", async () => {
    const { router } = renderAt("/terms#section-6");
    await waitFor(() => expect(scrolledTo).toEqual(["section-6"]));

    await act(async () => {
      await router.navigate("/terms#section-2");
    });
    await waitFor(() => expect(scrolledTo).toEqual(["section-6", "section-2"]));

    await act(async () => {
      await router.navigate(-1);
    });
    await waitFor(() => expect(scrolledTo).toEqual(["section-6", "section-2", "section-6"]));

    await act(async () => {
      await router.navigate(1);
    });
    await waitFor(() => expect(scrolledTo).toEqual(["section-6", "section-2", "section-6", "section-2"]));

    // Moving within the document never asks the server again.
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});

describe("arriving from another page", () => {
  it("lands on the refund section when a link such as the footer's is followed", async () => {
    renderAt("/");

    fireEvent.click(screen.getByRole("link", { name: "سياسة الإلغاء والاسترداد" }));

    await waitFor(() => expect(scrolledTo).toEqual(["section-6"]));
  });

  it("asks for no scroll if the page is left before the terms arrive", async () => {
    const release = respondLater();
    const { unmount } = renderAt("/terms#section-6");

    unmount();
    await release();
    await settle();

    expect(scrolledTo).toEqual([]);
  });
});

describe("fragments that are not sections", () => {
  it.each([
    ["an id this version does not have", "/terms#section-99"],
    ["a malformed escape", "/terms#%E0%A4%A"],
    ["something shaped like a selector", "/terms#section-6,%20body"],
    ["markup", "/terms#%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E"],
    ["an empty fragment", "/terms#"],
  ])("ignores %s and still renders the terms", async (_label, url) => {
    renderAt(url);

    await screen.findByRole("article");
    await settle();

    expect(scrolledTo).toEqual([]);
  });
});

describe("sectionIdFromHash", () => {
  const ids = new Set(["section-1", "section-6"]);

  it("accepts only ids the document declares", () => {
    expect(sectionIdFromHash("#section-6", ids)).toBe("section-6");
    expect(sectionIdFromHash("#section%2D6", ids)).toBe("section-6");
    expect(sectionIdFromHash("#section-7", ids)).toBeNull();
    expect(sectionIdFromHash("#", ids)).toBeNull();
    expect(sectionIdFromHash("", ids)).toBeNull();
    expect(sectionIdFromHash("section-6", ids)).toBeNull();
    expect(sectionIdFromHash("#%E0%A4%A", ids)).toBeNull();
  });
});
