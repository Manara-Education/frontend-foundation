import { FileText, RotateCw, Search, X } from "lucide-react";
import { Skeleton } from "@/shared/components/skeleton";
import { BORDER, DANGER, FAINT, FONT, INK, MUTED, PRIMARY, SURFACE_TINT, cardStyle } from "../../components/settings-tokens";
import { RANGE_LABELS, STATUS_LABELS } from "../formatters/billing.formatter";
import type { TransactionsState } from "../hooks/use-transactions";
import type { DateRange, TransactionFilters, TransactionRow } from "../types/billing.types";

interface InvoicesContentProps {
  filters: TransactionFilters;
  state: TransactionsState;
  search: string;
  setSearch: (value: string) => void;
  submitSearch: () => void;
  setStatus: (status: string) => void;
  setRange: (range: DateRange) => void;
  setPage: (page: number) => void;
  clearFilter: (name: "q" | "status" | "range") => void;
  clearAll: () => void;
  retry: () => void;
  openTransaction: (reference: string) => void;
}

const STATUS_TONES: Record<string, string> = {
  PAID: "#1B7A43",
  FAILED: DANGER,
  CANCELLED: MUTED,
  REFUNDED: "#5B3E99",
  PARTIALLY_REFUNDED: "#5B3E99",
  AWAITING_PAYMENT: "#8A5A00",
  PROCESSING: "#8A5A00",
};

/**
 * "الفواتير والمدفوعات": every payment record, with the summary the server computes over all rows
 * the filters match. Simulated and older records are listed but never counted as money paid.
 */
export function InvoicesContent(props: InvoicesContentProps) {
  const { filters, state } = props;
  const chips = [
    filters.q ? { name: "q" as const, label: `بحث: ${filters.q}` } : null,
    filters.status ? { name: "status" as const, label: STATUS_LABELS[filters.status] } : null,
    filters.range !== "all" ? { name: "range" as const, label: RANGE_LABELS[filters.range] } : null,
  ].filter((chip): chip is { name: "q" | "status" | "range"; label: string } => chip !== null);

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: FONT }}>
      <Summary state={state} />

      <section aria-label="تصفية العمليات" className="flex flex-col gap-3 p-4" style={cardStyle}>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            props.submitSearch();
          }}
          className="flex gap-2"
        >
          <label htmlFor="billing-search" className="sr-only">ابحث برقم الإيصال أو اسم الدورة أو المرجع</label>
          <input
            id="billing-search"
            type="search"
            value={props.search}
            onChange={(event) => props.setSearch(event.target.value)}
            placeholder="ابحث برقم الإيصال أو اسم الدورة أو المرجع"
            className="flex-1 min-w-0 rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
            style={{ fontFamily: FONT, fontSize: 13.5, border: `1.5px solid ${BORDER}` }}
          />
          <button type="submit" aria-label="بحث" className="rounded-xl px-3 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]" style={{ background: PRIMARY, color: "#fff", border: "none" }}>
            <Search size={16} aria-hidden="true" />
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          <label htmlFor="billing-status" className="sr-only">الحالة</label>
          <select
            id="billing-status"
            value={filters.status}
            onChange={(event) => props.setStatus(event.target.value)}
            className="rounded-xl px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
            style={{ fontFamily: FONT, fontSize: 13, border: `1.5px solid ${BORDER}`, background: "#fff" }}
          >
            <option value="">كل الحالات</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <div role="group" aria-label="الفترة" className="flex flex-wrap gap-1.5">
            {(Object.keys(RANGE_LABELS) as DateRange[]).map((range) => (
              <button
                key={range}
                type="button"
                aria-pressed={filters.range === range}
                onClick={() => props.setRange(range)}
                className="rounded-full px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
                style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${filters.range === range ? PRIMARY : BORDER}`, background: filters.range === range ? SURFACE_TINT : "#fff", color: filters.range === range ? PRIMARY : MUTED }}
              >
                {RANGE_LABELS[range]}
              </button>
            ))}
          </div>
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.name}
                type="button"
                onClick={() => props.clearFilter(chip.name)}
                aria-label={`إزالة الفلتر: ${chip.label}`}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
                style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, background: SURFACE_TINT, border: "none" }}
              >
                {chip.label} <X size={12} aria-hidden="true" />
              </button>
            ))}
            <button type="button" onClick={props.clearAll} className="rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]" style={{ fontSize: 12, fontWeight: 700, color: MUTED, background: "transparent", border: "none" }}>
              مسح الكل
            </button>
          </div>
        )}
      </section>

      <Results {...props} />
    </div>
  );
}

function Summary({ state }: { state: TransactionsState }) {
  if (state.status !== "ready") return null;
  const { confirmedTotals, totalItems, excludedCount } = state.page;
  return (
    <section aria-label="ملخص المدفوعات" className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1 p-4" style={cardStyle}>
        <span style={{ fontSize: 12.5, color: FAINT }}>إجمالي المدفوع فعليًا</span>
        {confirmedTotals.length > 0 ? (
          confirmedTotals.map((total) => <strong key={total} style={{ fontSize: 20, color: INK }}>{total}</strong>)
        ) : (
          <strong style={{ fontSize: 16, color: INK }}>لا توجد مدفوعات مؤكدة</strong>
        )}
        {excludedCount > 0 && (
          <span style={{ fontSize: 11.5, color: FAINT }}>لا يشمل {excludedCount.toLocaleString("ar-EG")} عملية تجريبية أو سابقة.</span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4" style={cardStyle}>
        <span style={{ fontSize: 12.5, color: FAINT }}>عدد العمليات</span>
        <strong style={{ fontSize: 20, color: INK }}>{totalItems.toLocaleString("ar-EG")}</strong>
        <span style={{ fontSize: 11.5, color: FAINT }}>حسب الفلاتر الحالية</span>
      </div>
    </section>
  );
}

function Results(props: InvoicesContentProps) {
  const { state } = props;
  if (state.status === "loading") {
    return (
      <div aria-busy="true" aria-label="جارٍ التحميل" className="flex flex-col gap-2">
        {[0, 1, 2].map((key) => <Skeleton key={key} className="h-16 rounded-2xl" />)}
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center" style={cardStyle}>
        <p style={{ fontSize: 14, color: MUTED }}>تعذّر تحميل العمليات.</p>
        <button type="button" onClick={props.retry} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: "#fff", background: PRIMARY, border: "none" }}>
          <RotateCw size={14} aria-hidden="true" /> إعادة المحاولة
        </button>
      </div>
    );
  }
  const { rows, page, totalPages } = state.page;
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center" style={cardStyle}>
        <FileText size={24} color={PRIMARY} aria-hidden="true" />
        <p style={{ fontSize: 14, fontWeight: 700, color: INK }}>لا توجد عمليات</p>
        <p style={{ fontSize: 12.5, color: FAINT }}>ستظهر هنا عمليات الشراء والاشتراك عند إجرائها.</p>
      </div>
    );
  }
  return (
    <>
      {/* Desktop: a table. Mobile: one card per row. */}
      <div className="hidden md:block overflow-hidden" style={cardStyle}>
        <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
          <caption className="sr-only">العمليات</caption>
          <thead>
            <tr style={{ color: FAINT, textAlign: "start" }}>
              {["التاريخ", "الشراء", "المبلغ", "رقم الإيصال", "الحالة", ""].map((heading, index) => (
                <th key={index} scope="col" style={{ fontWeight: 600, padding: "12px 14px", textAlign: "start", borderBottom: `1px solid ${BORDER}` }}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.reference} style={{ borderBottom: `1px solid ${BORDER}`, color: INK }}>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontWeight: 600 }}>{row.courseTitle}</span>
                  {row.provenanceLabel && <span style={{ display: "block", fontSize: 11.5, color: "#8A5A00" }}>{row.provenanceLabel}</span>}
                </td>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap", fontWeight: 700 }}>{row.amountLabel ?? "غير معروف"}</td>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}><span dir="ltr" style={{ unicodeBidi: "isolate", fontSize: 12.5 }}>{row.receiptNumber ?? "—"}</span></td>
                <td style={{ padding: "12px 14px" }}><StatusDot row={row} /></td>
                <td style={{ padding: "12px 14px" }}><DetailsButton row={row} onOpen={props.openTransaction} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="md:hidden flex flex-col gap-2.5" aria-label="العمليات">
        {rows.map((row) => (
          <li key={row.reference} className="flex flex-col gap-2 p-4" style={cardStyle}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p style={{ fontWeight: 700, fontSize: 14, color: INK, overflowWrap: "anywhere" }}>{row.courseTitle}</p>
                <p style={{ fontSize: 12, color: FAINT }}>{row.dateLabel}</p>
                {row.provenanceLabel && <p style={{ fontSize: 11.5, color: "#8A5A00" }}>{row.provenanceLabel}</p>}
              </div>
              <strong style={{ fontSize: 14, color: INK, whiteSpace: "nowrap" }}>{row.amountLabel ?? "غير معروف"}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <StatusDot row={row} />
              <DetailsButton row={row} onOpen={props.openTransaction} />
            </div>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <nav aria-label="صفحات العمليات" className="flex items-center justify-center gap-3">
          <button type="button" disabled={page === 0} onClick={() => props.setPage(page - 1)} className="rounded-xl px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92] disabled:opacity-40" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: PRIMARY, background: "#fff", border: `1.5px solid ${BORDER}` }}>السابق</button>
          <span style={{ fontSize: 13, color: MUTED }}>صفحة {(page + 1).toLocaleString("ar-EG")} من {totalPages.toLocaleString("ar-EG")}</span>
          <button type="button" disabled={page + 1 >= totalPages} onClick={() => props.setPage(page + 1)} className="rounded-xl px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92] disabled:opacity-40" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: PRIMARY, background: "#fff", border: `1.5px solid ${BORDER}` }}>التالي</button>
        </nav>
      )}
    </>
  );
}

function StatusDot({ row }: { row: TransactionRow }) {
  return (
    <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12.5, fontWeight: 700, color: STATUS_TONES[row.status] ?? MUTED }}>
      <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 999, background: "currentColor" }} />
      {row.statusLabel}
    </span>
  );
}

function DetailsButton({ row, onOpen }: { row: TransactionRow; onOpen: (reference: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(row.reference)}
      aria-label={`تفاصيل عملية ${row.courseTitle} بتاريخ ${row.dateLabel}`}
      className="rounded-lg px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
      style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: PRIMARY, background: SURFACE_TINT, border: "none" }}
    >
      التفاصيل
    </button>
  );
}
