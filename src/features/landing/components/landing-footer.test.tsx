import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { approvedContactChannels, PUBLIC_BUSINESS_FACTS } from "@/shared/business";
import { LandingFooter } from "./landing-footer";

function renderFooter() {
  render(
    <MemoryRouter>
      <LandingFooter />
    </MemoryRouter>,
  );
  return screen.getByRole("contentinfo");
}

describe("the landing footer", () => {
  it("names the business and links the terms from the shared public facts", () => {
    const footer = renderFooter();

    expect(footer).toHaveTextContent(`${PUBLIC_BUSINESS_FACTS.brand.latin}.`);
    expect(within(footer).getByRole("link", { name: "الشروط والأحكام" })).toHaveAttribute(
      "href",
      PUBLIC_BUSINESS_FACTS.legalLinks.terms,
    );
  });

  it("offers no email or phone link that is not an approved fact", () => {
    const footer = renderFooter();

    const contactHrefs = within(footer)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("mailto:") || href.startsWith("tel:"));

    expect(contactHrefs).toEqual(
      approvedContactChannels()
        .map((channel) => channel.href)
        .filter((href) => contactHrefs.includes(href)),
    );
    expect(contactHrefs.length).toBeLessThanOrEqual(approvedContactChannels().length);
  });
});
