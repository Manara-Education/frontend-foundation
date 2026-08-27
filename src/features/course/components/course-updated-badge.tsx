import { RefreshCw } from "lucide-react";

const FONT = "'Cairo', sans-serif";

/**
 * "تم التحديث" — the course changed after the learner could last have seen it.
 *
 * <h4>One component, both screens</h4>
 * My Courses and Course Details show the same badge because they are answering the same
 * question, and the answer is the backend's `hasUpdatesSincePublish`. Neither screen
 * decides anything for itself: there is no timestamp comparison here, and none in either
 * caller, so the two can never drift into disagreeing about the same course.
 *
 * <h4>Why not the design-system `Badge`</h4>
 * Every status chip on these two screens — "منشورة", "مسودة", the progress pill on the
 * course card — is a hand-styled pill in this same shape, and none of them uses
 * `shared/components/Badge`. A shadcn-styled badge dropped between them would read as a
 * foreign element. This matches its neighbours instead, and is shared so there is still
 * only one place the state is worded and drawn.
 *
 * @param tone `solid` for the tinted-glass pill that sits over the Course Details hero
 *             image; `soft` for the light pill that sits in a card's content area.
 */
export function CourseUpdatedBadge({ tone = "soft" }: { tone?: "soft" | "solid" }) {
  const solid = tone === "solid";

  return (
    <span
      // Announced rather than merely coloured: the badge carries information a screen
      // reader user needs as much as a sighted one, and the icon alone would not say it.
      role="status"
      aria-label="تم تحديث محتوى هذه الدورة"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        // Logical padding, so the icon keeps its place beside the text under both
        // directions rather than being pushed to the wrong side in LTR.
        paddingBlock: 4,
        paddingInline: "10px 8px",
        borderRadius: 99,
        // flexShrink so a long course title cannot squeeze the badge out of shape, and
        // whiteSpace so it wraps as one piece rather than breaking mid-phrase.
        flexShrink: 0,
        whiteSpace: "nowrap",
        maxWidth: "100%",
        background: solid ? "rgba(255,255,255,0.92)" : "rgba(234,156,26,0.10)",
        border: solid ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(234,156,26,0.28)",
        backdropFilter: solid ? "blur(8px)" : undefined,
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.6,
        color: "#A16207",
      }}
    >
      <RefreshCw size={11} strokeWidth={2.4} style={{ flexShrink: 0 }} aria-hidden="true" />
      تم التحديث
    </span>
  );
}
