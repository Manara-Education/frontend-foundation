import { AnimatePresence } from "motion/react";
import { ClipboardList } from "lucide-react";
import { FONT, PRIMARY, getQuizKindCopy } from "../formatters/quiz-player.formatter";
import { useQuizPlayer } from "../hooks/use-quiz-player";
import type { QuizKind, QuizResultView, QuizView } from "../types/quiz-player.types";
import { FailedResult } from "./failed-result";
import { PreviouslyPassed } from "./previously-passed";
import { PassedResult } from "./passed-result";
import { QuizIntro } from "./quiz-intro";
import { QuizLocked } from "./quiz-locked";
import { QuizTaking } from "./quiz-taking";
import { SubmitConfirmDialog } from "./submit-confirm-dialog";

export interface QuizPlayerProps {
  courseId: number;
  quiz: QuizView;
  /** Decides the wording only — the flow itself is identical for all three owners. */
  kind: QuizKind;
  /** Fired after every graded submission, so the caller can refresh progression. */
  onResult?: (result: QuizResultView) => void;
  /** Primary action of the passed card. Defaults to doing nothing but closing the flow. */
  onPassAction?: () => void;
  /** Overrides the kind's default label for that action. */
  passActionLabel?: string;
  /** Disables the passed card's action while the caller is still working. */
  isPassActionPending?: boolean;
}

/**
 * The one quiz player: lesson quiz, module exam and course final exam all render through
 * this component.
 *
 * Nothing here scores anything. `RESULT` is only ever reached from a server response, so
 * the pass/fail screens show the backend's verdict rather than a comparison the client
 * made.
 */
export function QuizPlayer({
  courseId,
  quiz,
  kind,
  onResult,
  onPassAction,
  passActionLabel,
  isPassActionPending = false,
}: QuizPlayerProps) {
  const copy = getQuizKindCopy(kind);
  const player = useQuizPlayer({ courseId, quiz, onResult });
  const { state } = player;

  const isAnswering = state.status === "ANSWERING" || state.status === "SUBMITTING";

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4" style={{ marginBottom: 16 }}>
        <div
          className="rounded-xl flex items-center justify-center"
          style={{ width: 28, height: 28, background: "rgba(78,91,146,0.09)", color: PRIMARY }}
        >
          <ClipboardList size={14} strokeWidth={1.8} />
        </div>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: "#1E2340" }}>
          {copy.sectionTitle}
        </span>
      </div>

      <AnimatePresence>
        {player.isConfirmingSubmit && (
          <SubmitConfirmDialog
            onConfirm={player.confirmSubmit}
            onReview={player.cancelSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state.status === "LOCKED" && (
          <QuizLocked key="locked" title={copy.lockedTitle} subtitle={copy.lockedSubtitle} />
        )}

        {state.status === "PREVIOUSLY_PASSED" && (
          <PreviouslyPassed key="prev-passed" quiz={quiz} onReview={player.reviewPreviousAttempt} />
        )}

        {state.status === "INTRO" && (
          <QuizIntro key="intro" quiz={quiz} onStart={player.start} />
        )}

        {isAnswering && (
          <QuizTaking
            key={`taking-${player.currentIndex}`}
            quiz={quiz}
            answers={player.answers}
            currentIndex={player.currentIndex}
            isSubmitting={state.status === "SUBMITTING"}
            submitError={player.submitError}
            hintState={player.hintState}
            onAnswer={player.answer}
            onNext={player.goNext}
            onPrev={player.goPrevious}
            onSubmit={player.requestSubmit}
            onRequestHint={player.requestHint}
          />
        )}

        {state.status === "RESULT" && state.result.passed && (
          <PassedResult
            key="result-pass"
            result={state.result}
            subtitle={copy.passSubtitle}
            actionLabel={passActionLabel ?? copy.passActionLabel}
            isActionPending={isPassActionPending}
            onAction={() => onPassAction?.()}
          />
        )}

        {state.status === "RESULT" && !state.result.passed && (
          <FailedResult
            key="result-fail"
            result={state.result}
            subtitle={copy.failSubtitle}
            returnLabel={copy.failReturnLabel}
            onRetry={player.retry}
            onReturn={player.returnToIntro}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
