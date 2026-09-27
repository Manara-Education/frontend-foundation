import { useCallback, useEffect, useState } from "react";
import { getBillingCapabilitiesRequest } from "../api/billing.api";
import type { BillingCapabilitiesResponse } from "../types/billing.types";

export type PaymentMethodsState =
  | { status: "loading" }
  | { status: "ready"; capabilities: BillingCapabilitiesResponse }
  | { status: "error" };

/** What the server says this deployment supports; the tab offers nothing beyond it. */
export function usePaymentMethods() {
  const [state, setState] = useState<PaymentMethodsState>({ status: "loading" });
  const load = useCallback(() => {
    setState({ status: "loading" });
    getBillingCapabilitiesRequest()
      .then(({ data: body }) => setState({ status: "ready", capabilities: body.data! }))
      .catch(() => setState({ status: "error" }));
  }, []);
  useEffect(load, [load]);
  return { state, retry: load };
}
