import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { motion } from "motion/react";
import type { LessonRef } from "../types/lesson.types";
import { FONT, PRIMARY } from "./lesson.constants";

const IDLE_BORDER = "#ECECEC";
const HOVER_BORDER = "rgba(78,91,146,0.22)";
const IDLE_SHADOW = "0 2px 12px rgba(78,91,146,0.05)";
const HOVER_SHADOW = "0 4px 16px rgba(78,91,146,0.10)";

/**
 * Shared by all three cards. The rail is one column wide, so a card fills it, and
 * `textAlign: "start"` leaves the side to the document's direction rather than pinning the
 * text to one edge.
 */
const CARD: CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  borderRadius: 18,
  display: "flex",
  alignItems: "center",
  gap: 12,
  textAlign: "start",
};

/**
 * The square each card leads with. It comes first in the flex row, which puts it on the
 * leading edge — the right one under the page's `dir="rtl"` — without reversing the row.
 */
const ICON_TILE: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const LABEL: CSSProperties = {
  fontFamily: FONT,
  fontSize: 10,
  color: "#B0B7D4",
  marginBottom: 3,
};

const TITLE: CSSProperties = {
  fontFamily: FONT,
  fontSize: 13,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

interface LessonNavigationProps {
  prevLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  /** True when `nextLesson` exists but the curriculum has not opened it yet. */
  isNextLessonLocked: boolean;
  onNavigate: (lessonId: number) => void;
  /**
   * Where the control is being drawn.
   *
   * `"rail"` is the column beside a video, and is the default so a video lesson keeps exactly
   * the navigation it has. `"footer"` is the row under a lesson that is read, where there is no
   * player to sit beside and the natural place to go next is the end of the article.
   */
  layout?: "rail" | "footer";
  /**
   * The lesson's completion control, placed between the two neighbours in `"footer"` layout.
   *
   * Passed in rather than built here: completing a lesson is not navigation, and this component
   * has no business knowing how it is done. It only knows where it goes on the page.
   */
  action?: ReactNode;
}

/**
 * Where a learner goes from here, in either of the two shapes the lesson screen needs.
 *
 * <h2>The rail</h2>
 * The column beside a video: next first, because it is the move the screen is asking for, and
 * it carries the emphasis to match.
 *
 * <h2>The footer</h2>
 * The row under a lesson that is read, where there is no player to sit beside. It runs in
 * reading order — previous, the lesson's completion control, next — because at the end of an
 * article those three are the whole of what is left to do, and a rail floating beside a column
 * of text points at nothing.
 *
 * Both layouts draw the same two cards from the same props. A next lesson the curriculum has
 * not opened is still announced — the learner sees there is more ahead — but as a disabled
 * card: it has no click handler and cannot be focused, so the lock holds for the keyboard as
 * well as the pointer.
 */
export function LessonNavigation({
  prevLesson,
  nextLesson,
  isNextLessonLocked,
  onNavigate,
  layout = "rail",
  action,
}: LessonNavigationProps) {
  const [isPrevHovered, setIsPrevHovered] = useState(false);

  // A lesson with no neighbours has nothing to navigate to. In the footer it may still have a
  // lesson to complete, and the row stays for that alone rather than taking the button with it.
  if (!prevLesson && !nextLesson && !action) return null;

  const nextCard =
    nextLesson && !isNextLessonLocked ? (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigate(nextLesson.id)}
        style={{
          ...CARD,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(78,91,146,0.22)",
          transition: "box-shadow 0.2s",
        }}
      >
        <div style={{ ...ICON_TILE, background: "rgba(255,255,255,0.18)" }}>
          <ArrowLeft size={16} color="#fff" strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...LABEL, color: "rgba(255,255,255,0.65)" }}>الدرس التالي</div>
          <div style={{ ...TITLE, color: "#fff" }}>{nextLesson.title}</div>
        </div>
      </motion.button>
    ) : nextLesson ? (
      /*
        `disabled` is what stops this card, not its muted palette: it takes no click, no
        focus and no key press, so nothing here can reach a lesson the curriculum has
        not opened. It offers no hover or tap response either — there is nothing to
        promise. The lesson's own title is withheld along with the rest of it, so the
        card says only that the next lesson is locked.
      */
      <button
        disabled
        style={{
          ...CARD,
          background: "#F4F5FB",
          border: `1.5px solid ${IDLE_BORDER}`,
          opacity: 0.6,
          cursor: "default",
        }}
      >
        <div style={{ ...ICON_TILE, background: "rgba(196,201,222,0.2)" }}>
          <Lock size={14} color="#C4C9DE" strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={LABEL}>الدرس التالي</div>
          <div style={{ ...TITLE, color: "#B0B7D4" }}>مقفل</div>
        </div>
      </button>
    ) : null;

  const prevCard = prevLesson ? (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onNavigate(prevLesson.id)}
      onMouseEnter={() => setIsPrevHovered(true)}
      onMouseLeave={() => setIsPrevHovered(false)}
      style={{
        ...CARD,
        background: "#FFFFFF",
        // A card the learner has already been to answers a hover with a hint of the
        // primary tint and a little more lift, and stops there.
        border: `1.5px solid ${isPrevHovered ? HOVER_BORDER : IDLE_BORDER}`,
        cursor: "pointer",
        boxShadow: isPrevHovered ? HOVER_SHADOW : IDLE_SHADOW,
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <div style={{ ...ICON_TILE, background: "rgba(78,91,146,0.07)" }}>
        <ArrowRight size={16} color={PRIMARY} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={LABEL}>الدرس السابق</div>
        <div style={{ ...TITLE, color: "#1F2937" }}>{prevLesson.title}</div>
      </div>
    </motion.button>
  ) : null;

  /*
    The footer, for a lesson that is read.

    Document order is previous, then the action, then next — so `dir="rtl"` puts the previous
    lesson on the right and the next one on the left, and `dir="ltr"` would do the reverse,
    without either side being named here. Nothing is visually swapped: the card that navigates
    backwards is the card the reading direction places behind you.
  */
  if (layout === "footer") {
    return (
      <motion.nav
        aria-label="التنقل بين الدروس"
        className="lp-lesson-footer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
      >
        {/* Both side cells are rendered whether or not they hold a card: the empty one is what
            reserves the space that keeps the action on the centre line. */}
        <div className="lp-lesson-footer__side">{prevCard}</div>
        {action ? <div className="lp-lesson-footer__action">{action}</div> : null}
        <div className="lp-lesson-footer__side">{nextCard}</div>
      </motion.nav>
    );
  }

  return (
    <motion.nav
      aria-label="التنقل بين الدروس"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.22 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginBottom: 24,
      }}
    >
      {nextCard}
      {prevCard}
    </motion.nav>
  );
}
