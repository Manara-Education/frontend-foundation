import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AboutPage } from "./about-page";

function renderPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe("the about page", () => {
  it("renders the mission and the three-step start section", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "عن منارة" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "رسالتنا" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "كيف تبدأ" })).toBeInTheDocument();
  });

  it("sends a visitor to the courses anchor and to the contact page from its own calls to action", () => {
    renderPage();

    const cta = screen.getByRole("heading", { name: "ابدأ من الدورة التي تناسبك" }).closest("section")!;
    expect(within(cta).getByRole("link", { name: /استكشف الدورات/ })).toHaveAttribute("href", "/#courses");
    expect(within(cta).getByRole("link", { name: "تواصل معنا" })).toHaveAttribute("href", "/contact");
  });
});
