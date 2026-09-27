import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { STATUS_LABELS } from "../formatters/billing.formatter";
import { getTransactions } from "../services/billing.service";
import type { DateRange, TransactionFilters, TransactionPage, TransactionStatus } from "../types/billing.types";

const RANGES: readonly DateRange[] = ["all", "30d", "3m", "1y"];

/** Filters and paging live in the URL, so back/forward, refresh and shared links keep them. */
function readFilters(params: URLSearchParams): TransactionFilters {
  const status = params.get("status") ?? "";
  const range = (params.get("range") ?? "all") as DateRange;
  const page = Number(params.get("page") ?? "0");
  return {
    q: params.get("q") ?? "",
    status: status in STATUS_LABELS ? (status as TransactionStatus) : "",
    range: RANGES.includes(range) ? range : "all",
    page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
  };
}

export type TransactionsState =
  | { status: "loading" }
  | { status: "ready"; page: TransactionPage }
  | { status: "error" };

export function useTransactions() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const [state, setState] = useState<TransactionsState>({ status: "loading" });
  const [search, setSearch] = useState(filters.q);
  const [reload, setReload] = useState(0);
  const key = `${filters.q}|${filters.status}|${filters.range}|${filters.page}`;

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getTransactions(filters)
      .then((page) => !cancelled && setState({ status: "ready", page }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
    // `filters` is reconstructed each render; `key` is its identity.
  }, [key, reload]);

  /** Changing a filter returns to the first page; `tx` (an open receipt) is left alone. */
  const update = useCallback(
    (changes: Partial<Record<"q" | "status" | "range" | "page", string>>) => {
      setParams((current) => {
        const next = new URLSearchParams(current);
        for (const [name, value] of Object.entries(changes)) {
          if (!value || value === "all" || (name === "page" && value === "0")) next.delete(name);
          else next.set(name, value);
        }
        if (!("page" in changes)) next.delete("page");
        return next;
      });
    },
    [setParams],
  );

  return {
    filters,
    state,
    search,
    setSearch,
    submitSearch: () => update({ q: search.trim() }),
    setStatus: (status: string) => update({ status }),
    setRange: (range: DateRange) => update({ range }),
    setPage: (page: number) => update({ page: String(page) }),
    clearFilter: (name: "q" | "status" | "range") => {
      if (name === "q") setSearch("");
      update({ [name]: "" });
    },
    clearAll: () => {
      setSearch("");
      update({ q: "", status: "", range: "" });
    },
    retry: () => setReload((value) => value + 1),
    openTransaction: (reference: string) =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set("tx", reference);
        return next;
      }),
  };
}
