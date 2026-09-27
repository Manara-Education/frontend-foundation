import { BORDER, FONT, TEXT, TEXT_MUTED } from "@/features/landing/components/theme";
import { UserAvatar } from "@/shared/identity";
import type { PublicInstructor } from "../types/public-courses.types";

const HEADING_ID = "public-course-instructor";

/** "المدرّس": the teaching instructor's published name, photo and headline — nothing else. */
export function InstructorCard({ instructor }: { instructor: PublicInstructor }) {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="rs-longform"
      style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 22, padding: "clamp(20px, 4vw, 28px)", minInlineSize: 0 }}
    >
      <h2 id={HEADING_ID} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: TEXT, margin: "0 0 14px" }}>
        المدرّس
      </h2>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <UserAvatar fullName={instructor.name} avatarUrl={instructor.avatarUrl} size={56} fontSize={20} />
        <div style={{ minInlineSize: 0 }}>
          <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15.5, color: TEXT, margin: 0, overflowWrap: "anywhere" }}>{instructor.name}</p>
          {instructor.headline && (
            <p style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTED, margin: "2px 0 0", lineHeight: 1.8, overflowWrap: "anywhere" }}>
              {instructor.headline}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
