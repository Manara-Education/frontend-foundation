import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { PUBLIC_BUSINESS_FACTS, type PublicBusinessFacts } from "@/shared/business";
import { LandingFooter } from "./landing-footer";

/*
  The footer's legal and support links. Contact fixtures below use reserved example values
  and are test-only; the shipped facts carry no contact until an owner approves one.
*/

const APPROVAL = { approvedBy: "Test owner", approvedOn: "2026-09-14", evidence: "test fixture" };

const APPROVED: PublicBusinessFacts = {
  ...PUBLIC_BUSINESS_FACTS,
  supportEmail: { status: "approved", value: "support@example.eg", approval: APPROVAL },
  supportPhone: { status: "approved", value: "010 1234 5678", approval: APPROVAL },
};

function Where() {
  const location = useLocation();
  return <output aria-label="current location">{`${location.pathname}${location.hash}`}</output>;
}

function renderFooter(facts?: PublicBusinessFacts) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <LandingFooter facts={facts} /> },
      { path: "/terms", element: <Where /> },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
  return screen.getByRole("navigation", { name: "الشروط والدعم" });
}

describe("the footer's legal and support navigation", () => {
  it("links the terms and the refund clause from the shared facts", () => {
    const nav = renderFooter();

    expect(within(nav).getByRole("link", { name: "الشروط والأحكام" })).toHaveAttribute("href", "/terms");
    expect(within(nav).getByRole("link", { name: "سياسة الإلغاء والاسترداد" })).toHaveAttribute("href", "/terms#section-6");
    expect(PUBLIC_BUSINESS_FACTS.legalLinks.refundPolicy).toBe("/terms#section-6");
  });

  it("offers no contact link while no contact is approved", () => {
    const nav = renderFooter();

    const hrefs = within(nav).getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/terms", "/terms#section-6"]);
  });

  it("renders approved support channels as exact mailto and tel links", () => {
    const nav = renderFooter(APPROVED);

    const email = within(nav).getByRole("link", { name: "البريد الإلكتروني للدعم: support@example.eg" });
    const phone = within(nav).getByRole("link", { name: "هاتف الدعم: +20 10 1234 5678" });
    expect(email).toHaveAttribute("href", "mailto:support@example.eg");
    expect(phone).toHaveAttribute("href", "tel:+201012345678");
    expect(within(phone).getByText("+20 10 1234 5678")).toHaveAttribute("dir", "ltr");
  });

  it("is reachable by keyboard in reading order, with a visible focus style", async () => {
    const user = userEvent.setup();
    const nav = renderFooter(APPROVED);
    const links = within(nav).getAllByRole("link");

    for (const link of links) {
      await user.tab();
      expect(document.activeElement).toBe(link);
      expect(link.className).toContain("focus-visible:outline-2");
    }
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/terms",
      "/terms#section-6",
      "mailto:support@example.eg",
      "tel:+201012345678",
    ]);
  });

  it("takes an anonymous visitor to the refund section of the terms", async () => {
    const user = userEvent.setup();
    const nav = renderFooter();

    await user.click(within(nav).getByRole("link", { name: "سياسة الإلغاء والاسترداد" }));

    expect(screen.getByRole("status", { name: "current location" })).toHaveTextContent("/terms#section-6");
  });

  it("names the business from the shared facts", () => {
    renderFooter();

    expect(screen.getByRole("contentinfo")).toHaveTextContent(`${PUBLIC_BUSINESS_FACTS.brand.latin}. جميع الحقوق محفوظة.`);
  });
});
