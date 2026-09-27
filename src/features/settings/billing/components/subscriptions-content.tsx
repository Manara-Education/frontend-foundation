import { Link } from "react-router";
import { RotateCw } from "lucide-react";
import { Skeleton } from "@/shared/components/skeleton";
import { paths } from "@/shared/navigation/paths";
import { FAINT, FONT, INK, MUTED, PRIMARY, SURFACE_TINT, cardStyle } from "../../components/settings-tokens";
import type { SubscriptionsState } from "../hooks/use-subscriptions";
import type { SubscriptionRow } from "../types/billing.types";

/**
 * "الاشتراكات": what the learner bought, as the server recorded it. Every subscription today is a
 * fixed term — it ends on its date and nothing renews it — so there are no renewal controls to show.
 */
export function SubscriptionsContent({ state, retry }: { state: SubscriptionsState; retry: () => void }) {
  if (state.status === "loading") {
    return <div aria-busy="true" aria-label="جارٍ التحميل" className="flex flex-col gap-3"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>;
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center" style={{ ...cardStyle, fontFamily: FONT }}>
        <p style={{ fontSize: 14, color: MUTED }}>تعذّر تحميل الاشتراكات.</p>
        <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-xl px-4 py-2" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: "#fff", background: PRIMARY, border: "none" }}>
          <RotateCw size={14} aria-hidden="true" /> إعادة المحاولة
        </button>
      </div>
    );
  }
  const { current, previous, activeCount, totalItems } = state.page;
  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: FONT }}>
      <section aria-label="ملخص الاشتراكات" className="grid gap-3 grid-cols-2">
        <Metric label="اشتراكات سارية" value={activeCount} />
        <Metric label="كل الاشتراكات" value={totalItems} />
      </section>
      {totalItems === 0 ? (
        <div className="flex flex-col items-center gap-2 p-10 text-center" style={cardStyle}>
          <p style={{ fontSize: 14, fontWeight: 700, color: INK }}>لا توجد اشتراكات</p>
          <p style={{ fontSize: 12.5, color: FAINT }}>عند الاشتراك في دورة بخطة زمنية ستظهر هنا مدة الوصول وتفاصيلها.</p>
        </div>
      ) : (
        <>
          <Group title="الاشتراكات الحالية" rows={current} empty="لا توجد اشتراكات سارية حاليًا." />
          <Group title="الاشتراكات السابقة" rows={previous} empty="لا توجد اشتراكات سابقة." />
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 p-4" style={cardStyle}>
      <span style={{ fontSize: 12.5, color: FAINT }}>{label}</span>
      <strong style={{ fontSize: 22, color: INK }}>{value.toLocaleString("ar-EG")}</strong>
    </div>
  );
}

function Group({ title, rows, empty }: { title: string; rows: SubscriptionRow[]; empty: string }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2.5">
      <h3 style={{ fontSize: 15, fontWeight: 700, color: INK }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={{ fontSize: 12.5, color: FAINT }}>{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => <SubscriptionCard key={row.id} row={row} />)}
        </ul>
      )}
    </section>
  );
}

function SubscriptionCard({ row }: { row: SubscriptionRow }) {
  return (
    <li className="flex flex-col gap-2 p-4" style={cardStyle}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p style={{ fontSize: 14.5, fontWeight: 700, color: INK, overflowWrap: "anywhere" }}>{row.courseTitle}</p>
          <p style={{ fontSize: 12.5, color: MUTED }}>{row.planLabel}</p>
        </div>
        <span className="rounded-full px-3 py-1 flex-shrink-0" style={{ fontSize: 11.5, fontWeight: 700, color: row.running ? "#1B7A43" : MUTED, background: row.running ? "rgba(39,174,96,0.1)" : SURFACE_TINT }}>
          {row.running ? "مدة ثابتة · سارٍ" : "منتهٍ"}
        </span>
      </div>
      <p style={{ fontSize: 12.5, color: MUTED }}>فترة الوصول: {row.periodLabel}</p>
      <p style={{ fontSize: 12, color: FAINT }}>
        {row.running ? `وصول لمدة ثابتة ينتهي في ${row.expiresLabel} — لا يتجدد تلقائيًا.` : "انتهت مدة هذا الاشتراك."} {row.accessLabel}.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>
          {row.priceLabel ?? "المبلغ غير معروف"}
          {row.provenanceLabel && <span style={{ fontSize: 11.5, fontWeight: 600, color: "#8A5A00" }}> · {row.provenanceLabel}</span>}
        </span>
        {row.transactionReference && (
          <Link
            to={`${paths.settings.invoices}?tx=${encodeURIComponent(row.transactionReference)}`}
            className="rounded-lg px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
            style={{ fontSize: 12.5, fontWeight: 700, color: PRIMARY, background: SURFACE_TINT, textDecoration: "none" }}
          >
            عرض العملية
          </Link>
        )}
      </div>
    </li>
  );
}
