import { paths } from "@/shared/navigation/paths";
import { egyptianPhone, mailtoHref } from "./contact-links";

/**
 * The one place the public site's business identity and contact details come from.
 *
 * Every page that names the business, links to a legal document or offers a way to reach
 * support reads it from here, so the footer, the terms page and anything added later cannot
 * disagree — and changing a value is one reviewed edit, not a search across the codebase.
 *
 * ## Approved or pending — never guessed
 *
 * A contact or identity fact is either **approved** — with who approved publishing it, when,
 * and where that approval is recorded — or **pending**, with what is missing. Nothing in
 * between. A plausible-looking address or number that nobody confirmed is monitored would be
 * worse than none: a customer asking for a refund would write to it and never hear back.
 * Pending facts are simply not rendered; see `approvedContactChannels`.
 *
 * ## Static, and public by definition
 *
 * These values are deployment-owned and change rarely, so they live in source rather than in
 * a `VITE_` variable or an API: a reviewer sees the exact value that ships, and a build cannot
 * silently pick up something else. Everything here is shipped to every browser. Internal or
 * staff-only contacts must never be added.
 *
 * The provenance of each value, the inventory of literals this replaced and exactly what is
 * still missing are in `docs/PUBLIC_BUSINESS_FACTS.md`.
 */

export interface FactApproval {
  /** Who approved publishing the value, by role (and name if the owner wants it recorded). */
  approvedBy: string;
  /** ISO date of the approval. */
  approvedOn: string;
  /** Where the approval can be checked: a Notion page, a signed message, a ticket. */
  evidence: string;
}

export type PublicFact<T> =
  | { status: "approved"; value: T; approval: FactApproval }
  | { status: "pending"; missing: string };

export interface PublicBusinessFacts {
  /**
   * The product name the site already carries on every page. A brand, not a legal identity:
   * who operates the service is `legalName`.
   */
  brand: { arabic: string; latin: string };
  /** The registered or trading name customers can hold responsible. */
  legalName: PublicFact<string>;
  /** A monitored customer-support mailbox. */
  supportEmail: PublicFact<string>;
  /** An Egyptian support number, as `egyptianPhone` accepts it. */
  supportPhone: PublicFact<string>;
  legalLinks: {
    /** The published, versioned Terms and Conditions. */
    terms: string;
    /** Section 6 of those Terms — cancellation and refund. */
    refundPolicy: string;
    /** A standalone Privacy Policy page. */
    privacyPolicy: PublicFact<string>;
  };
}

export const PUBLIC_BUSINESS_FACTS: PublicBusinessFacts = {
  brand: { arabic: "منارة", latin: "Manara" },
  legalName: {
    status: "pending",
    missing: "The registered or trading name the owner approves for publication.",
  },
  supportEmail: {
    status: "pending",
    missing:
      "A monitored customer-support mailbox the owner approves for publication. The addresses found in configuration (support@manara-edu.com, support@manara.app) are unverified defaults, not approved channels.",
  },
  supportPhone: {
    status: "pending",
    missing: "An Egyptian support phone number the owner approves for publication.",
  },
  legalLinks: {
    terms: paths.terms,
    refundPolicy: `${paths.terms}#section-6`,
    privacyPolicy: {
      status: "pending",
      missing: "An approved Privacy Policy page (TECH-48, Phase 3). Terms §10 already refers to one.",
    },
  },
};

export interface ContactChannel {
  kind: "email" | "phone";
  /** Accessible Arabic name for the channel. */
  label: string;
  /** Text shown on the page. Written left-to-right. */
  display: string;
  href: string;
}

/**
 * The support channels a page may offer: only approved facts, and only ones that are
 * well-formed. With nothing approved this is empty, and the page offers no contact rather
 * than an invented one.
 */
export function approvedContactChannels(facts: PublicBusinessFacts = PUBLIC_BUSINESS_FACTS): ContactChannel[] {
  const channels: ContactChannel[] = [];

  if (facts.supportEmail.status === "approved") {
    const href = mailtoHref(facts.supportEmail.value);
    if (href) {
      channels.push({ kind: "email", label: "البريد الإلكتروني للدعم", display: facts.supportEmail.value.trim(), href });
    }
  }

  if (facts.supportPhone.status === "approved") {
    const phone = egyptianPhone(facts.supportPhone.value);
    if (phone) {
      channels.push({ kind: "phone", label: "هاتف الدعم", display: phone.display, href: `tel:${phone.dial}` });
    }
  }

  return channels;
}
