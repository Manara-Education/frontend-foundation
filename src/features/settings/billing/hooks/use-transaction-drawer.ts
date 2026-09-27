import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { downloadReceiptPdf, getReceipt, getTransaction } from "../services/billing.service";
import type { Receipt, TransactionDetail } from "../types/billing.types";

export type DrawerState =
  | { status: "closed" }
  | { status: "loading" }
  | { status: "ready"; detail: TransactionDetail; receipt: Receipt | null }
  | { status: "not-found" }
  | { status: "error" };

/** The transaction named by `?tx=` in the address, with its receipt when one was issued. */
export function useTransactionDrawer() {
  const [params, setParams] = useSearchParams();
  const reference = params.get("tx");
  const [state, setState] = useState<DrawerState>({ status: "closed" });
  const [downloading, setDownloading] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);

  useEffect(() => {
    if (!reference) {
      setState({ status: "closed" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    getTransaction(reference)
      .then(async (detail) => {
        const receipt = detail.row.receiptNumber ? await getReceipt(detail.row.receiptNumber).catch(() => null) : null;
        if (!cancelled) setState({ status: "ready", detail, receipt });
      })
      .catch((err: { statusCode?: number }) => {
        if (!cancelled) setState({ status: err?.statusCode === 404 ? "not-found" : "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [reference]);

  const close = () =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("tx");
      return next;
    });

  const download = async () => {
    if (state.status !== "ready" || !state.receipt || downloading) return;
    setDownloading(true);
    setDownloadFailed(false);
    try {
      await downloadReceiptPdf(state.receipt.number);
    } catch {
      setDownloadFailed(true);
    } finally {
      setDownloading(false);
    }
  };

  return { open: reference !== null, state, close, download, downloading, downloadFailed };
}
