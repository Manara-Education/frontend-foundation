import { CheckCircle2 } from "lucide-react";
import { PRIMARY, PRIMARY_DARK, FONT, BG_SOFT, TEXT, TEXT_MUTED, TEXT_LIGHT, BORDER } from "./theme";

export function InstructorMockup() {
  return (
    <div style={{ background: "#fff", borderRadius: 24, border: `1px solid ${BORDER}`, boxShadow: "0 8px 40px rgba(78,91,146,0.1)", overflow: "hidden", fontFamily: FONT, direction: "rtl" }}>
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`, padding: "18px 24px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>لوحة تحكم المدرس</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>إنشاء دورة تعليمية</div>
      </div>
      <div style={{ padding: "20px 24px" }}>
        {[
          { step: "١", title: "إنشاء الدورة",    done: true },
          { step: "٢", title: "إضافة الدروس",    done: true },
          { step: "٣", title: "إنشاء الاختبارات", done: false, active: true },
          { step: "٤", title: "مراجعة ونشر",     done: false },
        ].map(({ step, title, done, active }) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, background: done ? `${PRIMARY}18` : active ? PRIMARY : "rgba(78,91,146,0.06)", color: done ? PRIMARY : active ? "#fff" : TEXT_LIGHT, border: active ? "none" : done ? `1.5px solid ${PRIMARY}22` : `1.5px solid rgba(78,91,146,0.12)` }}>
              {done ? <CheckCircle2 size={15} strokeWidth={2.2} /> : step}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: active || done ? 600 : 400, color: done || active ? TEXT : TEXT_LIGHT }}>{title}</div>
              {active && <div style={{ fontSize: 11, color: PRIMARY, marginTop: 1 }}>الخطوة الحالية</div>}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: "12px 16px", borderRadius: 12, background: BG_SOFT, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 11.5, color: TEXT_MUTED, marginBottom: 8 }}>الدورة: تطوير الويب بـ React</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ n: "٨", l: "دروس" }, { n: "٣", l: "اختبارات" }, { n: "٤", l: "أقسام" }].map(({ n, l }) => (
              <div key={l} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8, background: "#fff", border: `1px solid ${BORDER}` }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: PRIMARY }}>{n}</div>
                <div style={{ fontSize: 10.5, color: TEXT_LIGHT }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
