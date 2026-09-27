import { Download, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/shared/components/sheet";
import { BORDER, DANGER, FAINT, FONT, INK, MUTED, PRIMARY } from "../../components/settings-tokens";
import type { DrawerState } from "../hooks/use-transaction-drawer";
import type { Receipt, TransactionDetail } from "../types/billing.types";

interface TransactionDrawerProps {
  open: boolean;
  state: DrawerState;
  close: () => void;
  download: () => void;
  downloading: boolean;
  downloadFailed: boolean;
}

/** A transaction and its receipt, from the left edge (the far side in RTL), up to 560px wide. */
export function TransactionDrawer({ open, state, close, download, downloading, downloadFailed }: TransactionDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? undefined : close())}>
      <SheetContent side="left" dir="rtl" className="w-full sm:max-w-[560px] overflow-y-auto p-0" style={{ fontFamily: FONT }}>
        <div className="flex flex-col gap-4 p-5">
          <SheetTitle style={{ fontSize: 17, fontWeight: 700, color: INK, paddingInlineStart: 28 }}>تفاصيل العملية</SheetTitle>
          <SheetDescription className="sr-only">البنود والمبالغ والإيصال</SheetDescription>
          {state.status === "loading" && <p aria-busy="true" style={{ color: MUTED, fontSize: 13 }}>جارٍ التحميل…</p>}
          {state.status === "not-found" && <p role="alert" style={{ color: MUTED, fontSize: 13 }}>لم يتم العثور على هذه العملية.</p>}
          {state.status === "error" && <p role="alert" style={{ color: DANGER, fontSize: 13 }}>تعذّر تحميل التفاصيل.</p>}
          {state.status === "ready" && (
            <>
              <Detail detail={state.detail} />
              {state.receipt ? (
                <ReceiptPanel receipt={state.receipt} download={download} downloading={downloading} failed={downloadFailed} />
              ) : (
                <p style={{ fontSize: 12.5, color: FAINT }}>لم يُصدر إيصال لهذه العملية.</p>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2" style={{ borderBottom: `1px solid ${BORDER}`, fontSize: strong ? 14.5 : 13 }}>
      <span style={{ color: MUTED }}>{label}</span>
      <span style={{ color: INK, fontWeight: strong ? 800 : 600, textAlign: "end", overflowWrap: "anywhere" }}>{value}</span>
    </div>
  );
}

function Detail({ detail }: { detail: TransactionDetail }) {
  const { row } = detail;
  return (
    <section aria-label="العملية" className="flex flex-col">
      <p style={{ fontSize: 15, fontWeight: 700, color: INK }}>{row.courseTitle}</p>
      {row.provenanceLabel && (
        <p style={{ fontSize: 12.5, fontWeight: 700, color: "#8A5A00", background: "#FFF4DB", borderRadius: 10, padding: "6px 10px", marginTop: 8 }}>
          {row.provenance === "SIMULATED" ? "محاكاة دفع — لم تُحصَّل أي أموال فعلية." : "سجل من قبل نظام الفوترة الحالي؛ تُعرض البيانات المسجّلة فقط."}
        </p>
      )}
      <div className="mt-3">
        <Row label="الحالة" value={row.statusLabel} />
        <Row label="التاريخ" value={row.dateLabel} />
        <Row label="الوصول إلى الدورة" value={row.accessLabel} />
        {detail.termLabel && <Row label="فترة الاشتراك" value={detail.termLabel} />}
        {detail.lines.map((line, index) => (
          <Row key={index} label={line.description} value={line.amountLabel ?? "غير معروف"} />
        ))}
        <Row label="المجموع الفرعي" value={detail.subtotalLabel ?? "غير معروف"} />
        {detail.discountLabel && <Row label="الخصم" value={detail.discountLabel} />}
        <Row label="الإجمالي" value={detail.totalLabel ?? "غير معروف"} strong />
        {detail.refundedLabel && <Row label="المسترد" value={detail.refundedLabel} />}
        <Row label="مرجع العملية" value={<span dir="ltr" style={{ unicodeBidi: "isolate", fontSize: 12 }}>{row.reference}</span>} />
        {detail.gatewayReference && <Row label="مرجع بوابة الدفع" value={<span dir="ltr" style={{ unicodeBidi: "isolate", fontSize: 12 }}>{detail.gatewayReference}</span>} />}
      </div>
    </section>
  );
}

function ReceiptPanel({ receipt, download, downloading, failed }: { receipt: Receipt; download: () => void; downloading: boolean; failed: boolean }) {
  return (
    <section aria-label="الإيصال" className="flex flex-col gap-2 rounded-2xl p-4" style={{ border: `1.5px solid ${BORDER}`, background: "#FAFBFE" }}>
      <div className="flex items-center justify-between gap-3">
        <p style={{ fontSize: 14, fontWeight: 700, color: INK }}>{receipt.simulated ? "إيصال تجريبي" : "إيصال دفع"}</p>
        <span dir="ltr" style={{ unicodeBidi: "isolate", fontSize: 12.5, color: MUTED }}>{receipt.number}</span>
      </div>
      <p style={{ fontSize: 12.5, color: MUTED }}>{receipt.issuedLabel} · {receipt.customerName}</p>
      <p style={{ fontSize: 11.5, color: FAINT }}>إيصال غير ضريبي.</p>
      <button
        type="button"
        onClick={download}
        disabled={downloading}
        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4E5B92] disabled:opacity-60"
        style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "#fff", background: PRIMARY, border: "none" }}
      >
        {downloading ? <Loader2 size={15} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Download size={15} aria-hidden="true" />}
        تحميل الإيصال PDF
      </button>
      {failed && <p role="alert" style={{ fontSize: 12.5, color: DANGER }}>تعذّر تحميل الإيصال. حاول مرة أخرى.</p>}
    </section>
  );
}
