import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { SecurityPage } from "./security-page";

function renderPage() {
  return render(
    <MemoryRouter>
      <SecurityPage />
    </MemoryRouter>,
  );
}

/*
  The Claude Design source for this page ("Security.dc.html") hardcoded
  security@manara-edu.com as a public vulnerability-reporting mailbox. It is not configured,
  monitored or approved anywhere in either repository, and backend-foundation/SECURITY.md
  explicitly documents the opposite decision: no public security mailbox, on purpose, in favour
  of GitHub Security Advisories. This test guards against that unapproved address resurfacing
  here, e.g. via a careless copy back from the design source.
*/
describe("the vulnerability-reporting section", () => {
  it("never publishes an unapproved security mailbox", () => {
    renderPage();

    expect(document.body).not.toHaveTextContent("security@manara-edu.com");
    expect(document.querySelectorAll('a[href^="mailto:"]').length).toBe(0);
  });

  it("routes reports to GitHub Security Advisories instead", () => {
    renderPage();

    const advisoryLinks = screen.getAllByRole("link", { name: /GitHub Security Advisories/ });
    expect(advisoryLinks.length).toBeGreaterThan(0);
    for (const link of advisoryLinks) {
      expect(link).toHaveAttribute(
        "href",
        "https://github.com/Manara-Education/backend-foundation/security/advisories/new",
      );
    }
  });

  it("offers a no-details public-issue fallback for reporters who cannot use GitHub Advisories", () => {
    renderPage();

    expect(screen.getByRole("link", { name: "تذكرة عامة" })).toHaveAttribute(
      "href",
      "https://github.com/Manara-Education/backend-foundation/issues/new",
    );
  });
});

describe("the draft framing", () => {
  it("marks itself clearly as an unapproved draft", () => {
    renderPage();

    expect(screen.getByText("مسودة — قيد المراجعة، وليست نسخة معتمدة")).toBeInTheDocument();
  });

  it("lists every section in the table of contents", () => {
    renderPage();

    const toc = screen.getByRole("navigation", { name: "محتويات سياسة الأمان" });
    expect(toc.querySelectorAll("a")).toHaveLength(6);
  });
});
