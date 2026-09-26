import { Lock } from "lucide-react";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_LIGHT, TEXT_MUTED } from "@/features/landing/components/theme";
import { formatDurationSeconds } from "../formatters/public-offer.formatter";
import type { PublicOutlineGroup } from "../types/public-courses.types";

const HEADING_ID = "public-course-outline";

/**
 * "محتوى الدورة": what the course covers, from the server's published outline only. Every lesson
 * is shown locked — nothing here plays or opens; access comes through the course itself.
 */
export function CourseOutline({ outline }: { outline: readonly PublicOutlineGroup[] }) {
  if (outline.length === 0) return null;
  const lessonCount = outline.reduce((total, group) => total + group.lessons.length, 0);
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="rs-longform"
      style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 22, padding: "clamp(20px, 4vw, 32px)", minInlineSize: 0 }}
    >
      <h2 id={HEADING_ID} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: TEXT, margin: "0 0 4px" }}>
        محتوى الدورة
      </h2>
      <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT_LIGHT, margin: "0 0 16px" }}>
        {lessonCount.toLocaleString("ar-EG")} درس · تُفتح الدروس بعد الانضمام إلى الدورة
      </p>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {outline.map((group, groupIndex) => (
          <li key={`${group.title ?? "flat"}-${groupIndex}`}>
            {group.title && (
              <h3 style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: PRIMARY, margin: "0 0 8px", overflowWrap: "anywhere" }}>
                {group.title}
              </h3>
            )}
            {group.lessons.length === 0 ? (
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT_LIGHT, margin: 0 }}>لا توجد دروس في هذه الوحدة بعد.</p>
            ) : (
              <ol style={{ listStyle: "none", margin: 0, padding: 0, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                {group.lessons.map((lesson, index) => {
                  const duration = formatDurationSeconds(lesson.durationSeconds);
                  return (
                    <li
                      key={lesson.id}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBlockStart: index === 0 ? "none" : `1px solid ${BORDER}`, fontFamily: FONT, fontSize: 14, color: TEXT }}
                    >
                      <Lock size={14} aria-hidden="true" style={{ color: TEXT_LIGHT, flexShrink: 0 }} />
                      <span style={{ flex: 1, minInlineSize: 0, overflowWrap: "anywhere" }}>{lesson.title}</span>
                      {duration && <span style={{ fontSize: 12, color: TEXT_MUTED, whiteSpace: "nowrap" }}>{duration}</span>}
                      <span className="sr-only">(مقفل)</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
