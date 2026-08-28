import { RefreshCw, Sparkles } from "lucide-react";

import type { ContentChangeState } from "@/shared/courses";

const FONT = "'Cairo', sans-serif";

/**
 * "تم التحديث" / "جديد" — what changed in this course since the learner enrolled.
 *
 * <h4>One component, every screen</h4>
 * My Courses, the Course Details hero and every row of the curriculum show the same badge
 * because they are answering the same question, and the answer is always the backend's:
 * `hasUpdatesSinceEnrollment` at course level, `change.state` per row. Nothing here
 * compares a timestamp, and neither does any caller — an enrolment date shipped to the
 * browser and compared in React is the server's rule implemented twice, and two
 * implementations of one rule are two answers waiting to disagree.
 *
 * <h4>Two states, deliberately different colours</h4>
 * `NEW` is content the learner has never had; `UPDATED` is content they have, changed. A
 * learner scanning a curriculum is looking for the first and tolerating the second, so
 * they do not share a colour. `UNCHANGED` renders nothing at all rather than a neutral
 * pill — a badge on every row is a badge on none.
 *
 * <h4>Why not the design-system `Badge`</h4>
 * Every status chip on these screens — "منشورة", "مسودة", the progress pill on the course
 * card — is a hand-styled pill in this same shape, and none of them uses
 * `shared/components/Badge`. A shadcn-styled badge dropped between them would read as a
 * foreign element. This matches its neighbours instead, and is shared so there is still
 * only one place the state is worded and drawn.
 *
 * @param state   which of the two things to say. `UNCHANGED` renders nothing.
 * @param tone    `solid` for the tinted-glass pill that sits over an image; `soft` for the
 *                light pill that sits in a content area or a curriculum row.
 * @param summary the server's sentence for this change — "تم تحديث محتوى الدرس". Shown as
 *                a tooltip rather than inline: the badge has to stay one short pill in a
 *                dense list, and the sentence is already localised, so it is passed
 *                through untouched rather than reworded here.
 */
export function CourseUpdatedBadge({
  state = "UPDATED",
  tone = "soft",
  summary,
}: {
  state?: ContentChangeState;
  tone?: "soft" | "solid";
  summary?: string | null;
}) {
  if (state === "UNCHANGED") return null;

  const isNew = state === "NEW";
  const solid = tone === "solid";

  // NEW is the platform's green — the same one the completed-lesson checkmark uses, so
  // "something good is here" reads consistently. UPDATED keeps the existing amber.
  const ink = isNew ? "#15803D" : "#A16207";
  const wash = isNew ? "rgba(34,197,94,0.10)" : "rgba(234,156,26,0.10)";
  const edge = isNew ? "rgba(34,197,94,0.28)" : "rgba(234,156,26,0.28)";

  const Icon = isNew ? Sparkles : RefreshCw;
  const label = isNew ? "جديد" : "تم التحديث";

  return (
    <span
      // Announced rather than merely coloured: the badge carries information a screen
      // reader user needs as much as a sighted one, and the icon alone would not say it.
      role="status"
      aria-label={summary ?? (isNew ? "محتوى جديد أُضيف بعد التحاقك" : "تم تحديث محتوى هذه الدورة")}
      title={summary ?? undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        // Logical padding, so the icon keeps its place beside the text under both
        // directions rather than being pushed to the wrong side in LTR.
        paddingBlock: 4,
        paddingInline: "10px 8px",
        borderRadius: 99,
        // flexShrink so a long title cannot squeeze the badge out of shape, and
        // whiteSpace so it wraps as one piece rather than breaking mid-phrase.
        flexShrink: 0,
        whiteSpace: "nowrap",
        maxWidth: "100%",
        background: solid ? "rgba(255,255,255,0.92)" : wash,
        border: solid ? "1px solid rgba(255,255,255,0.6)" : `1px solid ${edge}`,
        backdropFilter: solid ? "blur(8px)" : undefined,
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.6,
        color: ink,
      }}
    >
      <Icon size={11} strokeWidth={2.4} style={{ flexShrink: 0 }} aria-hidden="true" />
      {label}
    </span>
  );
}
