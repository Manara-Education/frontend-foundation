import type { ElementType } from "react";
import { CreditCard, Receipt, Repeat, ShieldCheck, Wallet } from "lucide-react";
import { paths } from "@/shared/navigation/paths";

/**
 * The Settings sections, in navigation order.
 *
 * The URL is the single source of truth for which section is open: the navigation reads the
 * current path and never keeps a "selected tab" of its own, so a deep link, a refresh and the
 * browser's back button all agree with what is highlighted.
 *
 * There is deliberately no billing "overview" entry — it was removed from the design on purpose.
 * Appearance is absent until its protected Aspo Kids preview can be ported from the design export
 * itself (see docs/manara-figma-integration in backend-foundation, blocker X1).
 */
export interface SettingsLink {
  id: string;
  label: string;
  to: string;
  icon: ElementType;
}

export interface SettingsSection extends SettingsLink {
  description: string;
  children?: readonly SettingsLink[];
}

export const BILLING_LINKS: readonly SettingsLink[] = [
  { id: "subscriptions", label: "الاشتراكات", to: paths.settings.subscriptions, icon: Repeat },
  { id: "payment-methods", label: "طرق الدفع", to: paths.settings.paymentMethods, icon: CreditCard },
  { id: "invoices", label: "الفواتير والمدفوعات", to: paths.settings.invoices, icon: Receipt },
];

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    id: "account",
    label: "الحساب والأمان",
    description: "بياناتك وكلمة المرور",
    to: paths.settings.account,
    icon: ShieldCheck,
  },
  {
    id: "billing",
    label: "الفوترة والمدفوعات",
    description: "الاشتراكات والدفع والفواتير",
    to: paths.settings.subscriptions,
    icon: Wallet,
    children: BILLING_LINKS,
  },
];

function isWithin(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Which section and which child link the path belongs to. */
export function activeSettingsLocation(pathname: string): { sectionId?: string; linkId?: string } {
  if (isWithin(pathname, paths.settings.billing)) {
    const link = BILLING_LINKS.find((candidate) => isWithin(pathname, candidate.to));
    return { sectionId: "billing", linkId: link?.id };
  }
  if (isWithin(pathname, paths.settings.account)) return { sectionId: "account" };
  return {};
}
