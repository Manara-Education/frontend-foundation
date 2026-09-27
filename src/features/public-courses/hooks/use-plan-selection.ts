import { useState } from "react";
import type { PublicOffer, PublicPlan } from "../types/public-courses.types";

/**
 * Which subscription plan the visitor has picked on the public page.
 *
 * Starts on the cheapest plan the server listed. If the selected id disappears from a refreshed
 * offer, the selection falls back to the cheapest again rather than pointing at nothing.
 */
export function usePlanSelection(offer: PublicOffer) {
  const plans: readonly PublicPlan[] = offer.kind === "SUBSCRIPTION" ? offer.plans : [];
  const cheapest = plans.reduce<PublicPlan | null>(
    (lowest, plan) => (lowest === null || plan.price.amount < lowest.price.amount ? plan : lowest),
    null,
  );
  const [selectedId, setSelectedId] = useState<number | null>(cheapest?.id ?? null);
  const selected = plans.find((plan) => plan.id === selectedId) ?? cheapest;
  return { plans, selected, select: setSelectedId };
}
