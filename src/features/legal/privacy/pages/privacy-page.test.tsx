import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { PrivacyPage } from "./privacy-page";

function renderPage() {
  return render(
    <MemoryRouter>
      <PrivacyPage />
    </MemoryRouter>,
  );
}

describe("the privacy draft", () => {
  it("marks itself clearly as an unapproved draft", () => {
    renderPage();

    expect(screen.getByText("مسودة — قيد المراجعة، وليست نسخة معتمدة")).toBeInTheDocument();
  });

  it("lists every section in the table of contents", () => {
    renderPage();

    const toc = screen.getByRole("navigation", { name: "محتويات سياسة الخصوصية" });
    expect(toc.querySelectorAll("a")).toHaveLength(9);
  });

  it("does not publish an unapproved support mailbox", () => {
    renderPage();

    expect(document.querySelectorAll('a[href^="mailto:"]').length).toBe(0);
    expect(screen.getByRole("link", { name: "صفحة تواصل معنا" })).toHaveAttribute("href", "/contact");
  });

  it("names its own approval gaps rather than asserting a legal name or effective date", () => {
    renderPage();

    expect(screen.getByText("ما يلزم لاعتماد هذه المسودة")).toBeInTheDocument();
    expect(screen.getByText(/لم يُحدَّد بعد/)).toBeInTheDocument();
  });
});
