import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { PUBLIC_BUSINESS_FACTS, type PublicBusinessFacts } from "@/shared/business";
import { ContactSupportChannels } from "./contact-support-channels";

const APPROVAL = { approvedBy: "Test owner", approvedOn: "2026-09-14", evidence: "test fixture" };

const APPROVED: PublicBusinessFacts = {
  ...PUBLIC_BUSINESS_FACTS,
  supportEmail: { status: "approved", value: "support@example.eg", approval: APPROVAL },
  supportPhone: { status: "approved", value: "010 1234 5678", approval: APPROVAL },
};

function renderChannels(facts?: PublicBusinessFacts) {
  return render(
    <MemoryRouter>
      <ContactSupportChannels facts={facts} />
    </MemoryRouter>,
  );
}

describe("the contact page's support channels", () => {
  it("offers no mailto or tel link while nothing is approved, and explains why honestly", () => {
    renderChannels();

    expect(screen.queryByRole("link", { name: /^البريد الإلكتروني للدعم/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^هاتف الدعم/ })).not.toBeInTheDocument();
    expect(screen.getByText(/قنوات الدعم المباشرة قيد الإعداد/)).toBeInTheDocument();
  });

  it("renders approved channels as exact mailto and tel links", () => {
    renderChannels(APPROVED);

    expect(screen.getByRole("link", { name: "البريد الإلكتروني للدعم: support@example.eg" })).toHaveAttribute(
      "href",
      "mailto:support@example.eg",
    );
    expect(screen.getByRole("link", { name: "هاتف الدعم: +20 10 1234 5678" })).toHaveAttribute(
      "href",
      "tel:+201012345678",
    );
  });

  it("always points to the refund policy before the visitor sends a payment question", () => {
    renderChannels();

    expect(screen.getByRole("link", { name: "سياسة الإلغاء والاسترداد" })).toHaveAttribute("href", "/terms#section-6");
  });
});
