import { useCallback, useEffect, useState } from "react";
import { getSubscriptions } from "../services/billing.service";
import type { SubscriptionPage } from "../types/billing.types";

export type SubscriptionsState =
  | { status: "loading" }
  | { status: "ready"; page: SubscriptionPage }
  | { status: "error" };

export function useSubscriptions() {
  const [state, setState] = useState<SubscriptionsState>({ status: "loading" });
  const load = useCallback(() => {
    setState({ status: "loading" });
    getSubscriptions()
      .then((page) => setState({ status: "ready", page }))
      .catch(() => setState({ status: "error" }));
  }, []);
  useEffect(load, [load]);
  return { state, retry: load };
}
