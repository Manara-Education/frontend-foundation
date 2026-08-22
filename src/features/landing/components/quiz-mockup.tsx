import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { PRIMARY, FONT, BG_SOFT, TEXT, TEXT_MUTED, BORDER } from "./theme";

export function QuizMockup({ showHint = false }: { showHint?: boolean }) {
  // `selected` starts on the correct answer so the preview opens in its
  // selected/correct state, exactly as it did before.
  const [selected, setSelected] = useState<number | null>(1);
  const answers = ["تجاهل الغضب تماماً", "التوقف قليلاً وأخذ نفس عميق قبل التصرف", "التعبير عن الغضب بالصراخ", "لوم الآخرين على ما حدث"];
  // 1-based; mirrors the "السؤال 1 من 10" counter and drives the progress ticks.
  const questionNumber = 1;
  return (
    <div style={{ background: "#fff", borderRadius: 24, border: `1px solid ${BORDER}`, boxShadow: "0 8px 40px rgba(78,91,146,0.1)", overflow: "hidden", fontFamily: FONT, direction: "rtl" }}>
      <div style={{ background: BG_SOFT, padding: "16px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: TEXT_MUTED }}>السؤال 1 من 10</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{ width: i < questionNumber ? 18 : 6, height: 5, borderRadius: 99, background: i < questionNumber - 1 ? PRIMARY : i === questionNumber - 1 ? `${PRIMARY}60` : "rgba(78,91,146,0.12)", transition: "all 0.2s" }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>
        <p style={{ fontWeight: 700, fontSize: 14.5, color: TEXT, lineHeight: 1.7, marginBottom: 20 }}>
          ما التصرف الأفضل لإدارة شعور الغضب؟
        </p>
        {answers.map((a, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, marginBottom: 8, cursor: "pointer", transition: "all 0.15s", border: `1.5px solid ${selected === i ? PRIMARY : BORDER}`, background: selected === i ? `${PRIMARY}08` : "#fff" }}>
            <div style={{ width: 20, height: 20, borderRadius: 99, border: `2px solid ${selected === i ? PRIMARY : BORDER}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selected === i && <div style={{ width: 10, height: 10, borderRadius: 99, background: PRIMARY }} />}
            </div>
            <span style={{ fontSize: 13, color: selected === i ? TEXT : TEXT_MUTED, fontWeight: selected === i ? 600 : 400 }}>{a}</span>
          </div>
        ))}
        {showHint && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: `rgba(78,91,146,0.05)`, border: `1px solid rgba(78,91,146,0.15)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Sparkles size={14} color={PRIMARY} />
              <span style={{ fontWeight: 700, fontSize: 12.5, color: PRIMARY }}>تلميح بالذكاء الاصطناعي</span>
            </div>
            <p style={{ fontSize: 12.5, color: TEXT_MUTED, lineHeight: 1.75, margin: 0 }}>
              الإجابة الصحيحة: التوقف قليلاً وأخذ نفس عميق قبل التصرف.
            </p>
          </motion.div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          {!showHint
            ? <button style={{ display: "flex", alignItems: "center", gap: 6, height: 38, paddingLeft: 14, paddingRight: 14, borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontFamily: FONT, fontSize: 12.5, color: PRIMARY, fontWeight: 600 }}>
                <Sparkles size={13} /> اطلب تلميحاً
              </button>
            : <div />
          }
          <button style={{ height: 40, paddingLeft: 24, paddingRight: 24, borderRadius: 11, background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 13.5 }}>
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
