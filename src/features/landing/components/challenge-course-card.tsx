import { CheckCircle2, Lock, Play, Zap } from "lucide-react";
import { CHALLENGE_COURSE } from "../content/challenge-course.content";
import { PRIMARY, PRIMARY_DARK, FONT, TEXT, TEXT_LIGHT, BORDER } from "./theme";

/**
 * The course card shown in the hero (Section 1) and in the product-experience
 * section (Section 6). Both render this same component, so both carry the same
 * approved copy from `challenge-course.content.ts`.
 */
export function ChallengeCourseCard() {
  const { label, statement, progressLabel, progressPercent, progressPercentLabel, lessonsLabel, activeBadge, items } = CHALLENGE_COURSE;

  return (
    <div className="rs-longform" style={{ background: "#fff", borderRadius: 24, border: `1px solid ${BORDER}`, boxShadow: "0 16px 64px rgba(78,91,146,0.14)", overflow: "hidden", fontFamily: FONT, direction: "rtl" }}>
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`, paddingBlock: 20, paddingInline: "clamp(18px, 5vw, 24px)" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 16 }}>{statement}</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>{progressLabel}</div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, blockSize: 6, marginBottom: 6 }}>
          <div style={{ inlineSize: `${progressPercent}%`, blockSize: "100%", background: "#fff", borderRadius: 99 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{lessonsLabel}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{progressPercentLabel}</span>
        </div>
      </div>
      <div style={{ padding: "16px 0" }}>
        {items.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, paddingBlock: 10, paddingInline: "clamp(16px, 5vw, 24px)", background: l.active ? `${PRIMARY}08` : "transparent", borderInlineStart: l.active ? `3px solid ${PRIMARY}` : "3px solid transparent", minInlineSize: 0 }}>
            <div style={{ flexShrink: 0, inlineSize: 28, blockSize: 28, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", background: l.done ? `${PRIMARY}18` : l.active ? PRIMARY : "rgba(78,91,146,0.06)", color: l.done ? PRIMARY : l.active ? "#fff" : TEXT_LIGHT }}>
              {l.done ? <CheckCircle2 size={14} /> : l.locked ? <Lock size={11} /> : l.quiz ? <Zap size={13} /> : <Play size={11} />}
            </div>
            <span style={{ fontSize: 13, fontWeight: l.active ? 700 : 500, color: l.locked ? TEXT_LIGHT : TEXT, flex: "1 1 0", minInlineSize: 0 }}>{l.title}</span>
            {l.active && <span style={{ fontSize: 10.5, fontWeight: 600, color: PRIMARY, background: `${PRIMARY}12`, borderRadius: 5, padding: "2px 8px", flexShrink: 0 }}>{activeBadge}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
