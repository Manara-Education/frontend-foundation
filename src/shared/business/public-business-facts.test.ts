import { describe, expect, it } from "vitest";
import indexHtml from "../../../index.html?raw";
import { TERMS_1_0 } from "@/features/legal/terms/content";
import {
  approvedContactChannels,
  PUBLIC_BUSINESS_FACTS,
  type PublicBusinessFacts,
  type PublicFact,
} from "./public-business-facts";
import { egyptianPhone, mailtoHref } from "./contact-links";

/*
  The published facts are checked against the rule that makes them publishable: approved with
  a record of who approved them, or pending with what is missing. The fixtures below are
  test-only and use reserved example values — they never reach the shipped configuration.
*/

const FACTS = PUBLIC_BUSINESS_FACTS;

function everyFact(facts: PublicBusinessFacts): [string, PublicFact<string>][] {
  return [
    ["legalName", facts.legalName],
    ["supportEmail", facts.supportEmail],
    ["supportPhone", facts.supportPhone],
    ["legalLinks.privacyPolicy", facts.legalLinks.privacyPolicy],
  ];
}

const APPROVAL = { approvedBy: "Test owner", approvedOn: "2026-09-14", evidence: "test fixture" };

const APPROVED_FIXTURE: PublicBusinessFacts = {
  ...FACTS,
  supportEmail: { status: "approved", value: "support@example.eg", approval: APPROVAL },
  supportPhone: { status: "approved", value: "010 1234 5678", approval: APPROVAL },
};

describe("the shipped public facts", () => {
  it.each(everyFact(FACTS))("%s is approved with a record, or pending with what is missing", (_name, fact) => {
    if (fact.status === "approved") {
      expect(fact.value.trim()).not.toBe("");
      expect(fact.approval.approvedBy.trim()).not.toBe("");
      expect(fact.approval.approvedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(fact.approval.evidence.trim()).not.toBe("");
    } else {
      expect(fact.missing.trim()).not.toBe("");
    }
  });

  it("carries no approved contact that is malformed", () => {
    if (FACTS.supportEmail.status === "approved") expect(mailtoHref(FACTS.supportEmail.value)).not.toBeNull();
    if (FACTS.supportPhone.status === "approved") expect(egyptianPhone(FACTS.supportPhone.value)).not.toBeNull();
    if (FACTS.legalLinks.privacyPolicy.status === "approved") expect(FACTS.legalLinks.privacyPolicy.value).toMatch(/^\//);
  });

  it("carries no placeholder, test or unverified-default value as an approved fact", () => {
    for (const [name, fact] of everyFact(FACTS)) {
      if (fact.status !== "approved") continue;
      expect(fact.value, name).not.toMatch(/example|test|invalid|localhost|manara-edu\.com|manara\.app|manara\.com/i);
      expect(fact.approval.evidence, name).not.toMatch(/fixture/i);
    }
  });

  it("offers no contact channel while nothing is approved", () => {
    const approvedContacts = [FACTS.supportEmail, FACTS.supportPhone].filter((fact) => fact.status === "approved");
    expect(approvedContactChannels()).toHaveLength(approvedContacts.length);
  });

  it("links only to the site's own pages", () => {
    expect(FACTS.legalLinks.terms).toBe("/terms");
    expect(FACTS.legalLinks.refundPolicy).toBe("/terms#section-6");
  });

  it("points the refund link at the published cancellation and refund clause", () => {
    const section = TERMS_1_0.sections.find((candidate) => `#${candidate.id}` === FACTS.legalLinks.refundPolicy.slice("/terms".length));
    expect(section?.title).toBe("الإلغاء والاسترداد");
  });

  it("names the brand the way the document title does", () => {
    expect(indexHtml).toContain(`<title>${FACTS.brand.arabic}</title>`);
  });
});

describe("approvedContactChannels", () => {
  it("renders an approved email and phone as mailto and international tel links", () => {
    expect(approvedContactChannels(APPROVED_FIXTURE)).toEqual([
      { kind: "email", label: "البريد الإلكتروني للدعم", display: "support@example.eg", href: "mailto:support@example.eg" },
      { kind: "phone", label: "هاتف الدعم", display: "+20 10 1234 5678", href: "tel:+201012345678" },
    ]);
  });

  it("drops an approved value that is not a single mailbox or an Egyptian number", () => {
    const malformed: PublicBusinessFacts = {
      ...FACTS,
      supportEmail: { status: "approved", value: "a@example.eg,b@example.eg", approval: APPROVAL },
      supportPhone: { status: "approved", value: "+1 202 555 0100", approval: APPROVAL },
    };
    expect(approvedContactChannels(malformed)).toEqual([]);
  });

  it("never renders a pending fact", () => {
    const pending: PublicBusinessFacts = {
      ...APPROVED_FIXTURE,
      supportPhone: { status: "pending", missing: "not yet" },
    };
    expect(approvedContactChannels(pending).map((channel) => channel.kind)).toEqual(["email"]);
  });
});
