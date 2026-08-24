import { motion, AnimatePresence } from "motion/react";
import { QuizPlayer, type QuizKind, type QuizView } from "@/features/quiz/student/quiz-player";

interface ExamPanelProps {
  courseId: number;
  quiz: QuizView;
  kind: QuizKind;
  isOpen: boolean;
  onPassed: () => void;
  onClose: () => void;
}

/**
 * The exam itself, opening in place under its row.
 *
 * It is the same {@link QuizPlayer} the lesson page mounts — the module exam and the
 * final exam are not a second player, only a second place the one player appears.
 *
 * The curriculum is refreshed when the learner leaves the passed card rather than the
 * moment the result lands: a refresh re-reads the quiz's server state, which would
 * otherwise re-open the player on "already passed" and pull the result out from under
 * them mid-read.
 */
export function ExamPanel({ courseId, quiz, kind, isOpen, onPassed, onClose }: ExamPanelProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key={`exam-${quiz.id}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div style={{ paddingTop: 12 }}>
            <QuizPlayer
              courseId={courseId}
              quiz={quiz}
              kind={kind}
              onPassAction={() => {
                onClose();
                onPassed();
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
