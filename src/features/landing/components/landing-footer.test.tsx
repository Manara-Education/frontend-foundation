import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { PUBLIC_BUSINESS_FACTS, type PublicBusinessFacts } from "@/shared/business";
import { LandingFooter } from "./landing-footer";

/*
  The footer's navigation, now split into the four columns the redesign introduced: brand/about,
  "discover" (site pages), "policies" (legal links) and contact. Contact fixtures below use
  reserved example values and are test-only; the shipped facts carry no contact until an owner
  approves one.
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
      { path: "/about", element: <Where /> },
      { path: "/contact", element: <Where /> },
      { path: "/privacy", element: <Where /> },
      { path: "/security", element: <Where /> },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
}

describe("the footer's policy navigation", () => {
  it("links the terms and the refund clause from the shared facts", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "السياسات والشروط" });

    expect(within(nav).getByRole("link", { name: "الشروط والأحكام" })).toHaveAttribute("href", "/terms");
    expect(within(nav).getByRole("link", { name: "سياسة الإلغاء والاسترداد" })).toHaveAttribute("href", "/terms#section-6");
    expect(PUBLIC_BUSINESS_FACTS.legalLinks.refundPolicy).toBe("/terms#section-6");
  });

  it("links the new privacy and security pages", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "السياسات والشروط" });

    expect(within(nav).getByRole("link", { name: "سياسة الخصوصية" })).toHaveAttribute("href", "/privacy");
    expect(within(nav).getByRole("link", { name: "سياسة الأمان" })).toHaveAttribute("href", "/security");
  });

  it("takes an anonymous visitor to the refund section of the terms", async () => {
    const user = userEvent.setup();
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "السياسات والشروط" });

    await user.click(within(nav).getByRole("link", { name: "سياسة الإلغاء والاسترداد" }));

    expect(screen.getByRole("status", { name: "current location" })).toHaveTextContent("/terms#section-6");
  });
});

describe("the footer's discover navigation", () => {
  it("links home, the courses anchor, about and contact", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: /^اكتشف/ });

    expect(within(nav).getByRole("link", { name: "الرئيسية" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "الدورات المتاحة" })).toHaveAttribute("href", "/#courses");
    expect(within(nav).getByRole("link", { name: /^عن /  })).toHaveAttribute("href", "/about");
    expect(within(nav).getByRole("link", { name: "تواصل معنا" })).toHaveAttribute("href", "/contact");
  });
});

describe("the footer's contact column", () => {
  it("offers no mailto or tel link while no contact is approved, and explains why", () => {
    renderFooter();

    expect(screen.queryByRole("link", { name: /^البريد الإلكتروني للدعم/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^هاتف الدعم/ })).not.toBeInTheDocument();
    expect(screen.getByText("قنوات الدعم المباشرة قيد الإعداد — راسلنا عبر النموذج أدناه.")).toBeInTheDocument();
  });

  it("always offers the contact page as a fallback channel", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: "صفحة التواصل" })).toHaveAttribute("href", "/contact");
  });

  it("renders approved support channels as exact mailto and tel links, and drops the fallback notice", () => {
    renderFooter(APPROVED);

    const email = screen.getByRole("link", { name: "البريد الإلكتروني للدعم: support@example.eg" });
    const phone = screen.getByRole("link", { name: "هاتف الدعم: +20 10 1234 5678" });
    expect(email).toHaveAttribute("href", "mailto:support@example.eg");
    expect(phone).toHaveAttribute("href", "tel:+201012345678");
    expect(within(phone).getByText("+20 10 1234 5678")).toHaveAttribute("dir", "ltr");
    expect(screen.queryByText("قنوات الدعم المباشرة قيد الإعداد — راسلنا عبر النموذج أدناه.")).not.toBeInTheDocument();
  });
});

describe("the footer as a whole", () => {
  it("every link and button carries a visible focus style", () => {
    renderFooter(APPROVED);

    const interactive = [...screen.getAllByRole("link"), ...screen.getAllByRole("button")];
    expect(interactive.length).toBeGreaterThan(0);
    for (const el of interactive) {
      expect(el.className).toContain("focus-visible:outline-2");
    }
  });

  it("scrolls to the top when the back-to-top control is activated", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as typeof window.scrollTo;
    renderFooter();

    await user.click(screen.getByRole("button", { name: "العودة إلى الأعلى" }));

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("names the business and keeps the early-development notice", () => {
    renderFooter();

    expect(screen.getByRole("contentinfo")).toHaveTextContent(`${PUBLIC_BUSINESS_FACTS.brand.latin}. جميع الحقوق محفوظة.`);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("منصة في مرحلة التطوير المبكر");
  });
});
