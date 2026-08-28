import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { FONT, PRIMARY, SUCCESS } from "./lesson.constants";

interface LessonCompleteButtonProps {
  isCompleted: boolean;
  isCompleting: boolean;
  /** False while the lesson is locked or its quiz is unpassed — the server would refuse either. */
  canComplete: boolean;
  /** True while the lesson's quiz still stands between the learner and completion. */
  isQuizRequired: boolean;
  onComplete: () => void;
}

/**
 * Manara's own completion control, for a lesson that has no playback to end.
 *
 * A video lesson completes when its video does. A rich-content lesson has no such moment, and the
 * alternatives are all worse than a button: completing on open marks a lesson done that nobody
 * read, and completing on scroll marks it done because a page was long enough to scroll. Both are
 * guesses about the learner's attention; this is the learner saying so.
 *
 * <h2>What separates this from an instructor's button</h2>
 * A lesson body can contain call-to-action buttons an instructor wrote, and one of them may well
 * say "Finish the lesson". Those are anchors: they navigate and cannot reach Manara's state. This
 * is the only control that completes a lesson, it lives outside the content rather than inside it,
 * and it is drawn in the platform's own green rather than in a variant an author can choose — so
 * the two are told apart by where they are and what they look like, as well as by what they can do.
 *
 * <h2>The completed state</h2>
 * Once complete it stays on the page as a disabled, ticked control rather than disappearing. A
 * control that vanishes leaves a learner wondering whether it worked; and the state is carried by a
 * tick and a word, not by colour alone.
 */
export function LessonCompleteButton({
  isCompleted,
  isCompleting,
  canComplete,
  isQuizRequired,
  onComplete,
}: LessonCompleteButtonProps) {
  if (isCompleted) {
    return (
      <div
        className="lp-complete-row"
        style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}
      >
        <span
          // A live region rather than a styled div: the learner who just pressed the button needs
          // to be told it worked, and the colour change alone does not tell them.
          role="status"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            minHeight: 48,
            padding: "0 24px",
            borderRadius: 14,
            background: "rgba(34,197,94,0.10)",
            border: "1.5px solid rgba(34,197,94,0.30)",
            color: "#15803D",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <Check size={16} strokeWidth={2.6} aria-hidden="true" />
          تم إكمال الدرس
        </span>
      </div>
    );
  }

  const disabled = !canComplete || isCompleting;

  return (
    <div
      className="lp-complete-row"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 16,
      }}
    >
      <motion.button
        type="button"
        onClick={onComplete}
        disabled={disabled}
        whileHover={disabled ? undefined : { y: -2 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.14 }}
        // Says what is happening rather than only showing it, and names why it cannot be pressed.
        aria-busy={isCompleting}
        aria-describedby={isQuizRequired ? "lp-complete-hint" : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 48,
          padding: "0 28px",
          borderRadius: 14,
          border: "none",
          background: disabled
            ? "rgba(78,91,146,0.16)"
            : `linear-gradient(135deg, ${SUCCESS} 0%, #16A34A 100%)`,
          color: disabled ? "#8A90AC" : "#FFFFFF",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 14,
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: disabled ? "none" : "0 4px 16px rgba(34,197,94,0.28)",
          maxWidth: "100%",
        }}
      >
        {isCompleting ? (
          <>
            <Loader2 size={16} className="lp-spin" aria-hidden="true" />
            جارٍ التسجيل…
          </>
        ) : (
          <>
            <Check size={16} strokeWidth={2.6} aria-hidden="true" />
            إكمال الدرس
          </>
        )}
      </motion.button>

      {isQuizRequired && (
        <span
          id="lp-complete-hint"
          style={{ fontFamily: FONT, fontSize: 12, color: PRIMARY, opacity: 0.8 }}
        >
          يجب اجتياز اختبار الدرس أولًا
        </span>
      )}
    </div>
  );
}
