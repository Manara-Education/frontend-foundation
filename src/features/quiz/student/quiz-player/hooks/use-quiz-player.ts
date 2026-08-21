import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/shared/api";
import { requestAiHint, submitQuiz } from "../services/quiz-player.service";
import type {
  QuizHintState,
  QuizPlayerState,
  QuizResultView,
  QuizView,
} from "../types/quiz-player.types";

export interface UseQuizPlayerArgs {
  courseId: number;
  quiz: QuizView;
  /** Fired after every graded submission so the caller can refresh progression. */
  onResult?: (result: QuizResultView) => void;
}

export interface UseQuizPlayerResult {
  state: QuizPlayerState;
  currentIndex: number;
  answers: Record<string, string>;
  submitError: string | null;
  isConfirmingSubmit: boolean;
  hintState: QuizHintState;
  start: () => void;
  answer: (questionId: string, optionId: string) => void;
  goNext: () => void;
  goPrevious: () => void;
  requestSubmit: () => void;
  cancelSubmit: () => void;
  confirmSubmit: () => void;
  retry: () => void;
  returnToIntro: () => void;
  reviewPreviousAttempt: () => void;
  requestHint: (questionId: string) => void;
}

/**
 * Decides where the player opens from what the server said, not from anything the
 * client remembers: a gated quiz opens locked, an already-cleared one opens on its
 * "previously passed" card, everything else on the intro.
 */
function initialState(quiz: QuizView): QuizPlayerState {
  if (!quiz.available) return { status: "LOCKED" };
  if (quiz.passed) return { status: "PREVIOUSLY_PASSED" };
  return { status: "INTRO" };
}

const EMPTY_HINTS: QuizHintState = {
  hints: {},
  loadingQuestionId: null,
  errorQuestionId: null,
};

export function useQuizPlayer({
  courseId,
  quiz,
  onResult,
}: UseQuizPlayerArgs): UseQuizPlayerResult {
  const [state, setState] = useState<QuizPlayerState>(() => initialState(quiz));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [hintState, setHintState] = useState<QuizHintState>(EMPTY_HINTS);

  // A refreshed curriculum can flip availability or the passed flag under the player;
  // when it does, the player re-opens on the state the server now reports.
  const openingState = `${quiz.id}:${quiz.available}:${quiz.passed}`;
  useEffect(() => {
    setState(initialState(quiz));
    setCurrentIndex(0);
    setSubmitError(null);
    setIsConfirmingSubmit(false);
    setHintState(EMPTY_HINTS);
    // `quiz` is re-derived on every parent render; the identity that matters is the
    // opening state it produces.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openingState]);

  const answers = useMemo(
    () => ("answers" in state ? state.answers : {}),
    [state],
  );

  const start = useCallback(() => {
    setCurrentIndex(0);
    setSubmitError(null);
    setState({ status: "ANSWERING", answers: {} });
  }, []);

  const answer = useCallback((questionId: string, optionId: string) => {
    setState((prev) =>
      prev.status === "ANSWERING"
        ? { status: "ANSWERING", answers: { ...prev.answers, [questionId]: optionId } }
        : prev,
    );
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, quiz.questions.length - 1));
  }, [quiz.questions.length]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const requestSubmit = useCallback(() => setIsConfirmingSubmit(true), []);
  const cancelSubmit = useCallback(() => setIsConfirmingSubmit(false), []);

  const confirmSubmit = useCallback(() => {
    setIsConfirmingSubmit(false);
    setSubmitError(null);

    setState((prev) => {
      if (prev.status !== "ANSWERING") return prev;
      const submitting: QuizPlayerState = { status: "SUBMITTING", answers: prev.answers };

      submitQuiz(courseId, quiz, prev.answers)
        .then((result) => {
          setState({ status: "RESULT", result });
          onResult?.(result);
        })
        .catch((err) => {
          console.error("Failed to submit quiz", err);
          setSubmitError(
            err instanceof ApiError
              ? err.errors[0] ?? "تعذر تسليم الاختبار، حاول مرة أخرى"
              : "تعذر تسليم الاختبار، حاول مرة أخرى",
          );
          setState({ status: "ANSWERING", answers: prev.answers });
        });

      return submitting;
    });
  }, [courseId, quiz, onResult]);

  const retry = useCallback(() => {
    setCurrentIndex(0);
    setSubmitError(null);
    setHintState(EMPTY_HINTS);
    setState({ status: "ANSWERING", answers: {} });
  }, []);

  const returnToIntro = useCallback(() => {
    setCurrentIndex(0);
    setSubmitError(null);
    setState({ status: "INTRO" });
  }, []);

  const reviewPreviousAttempt = useCallback(() => {
    setCurrentIndex(0);
    setSubmitError(null);
    setState({ status: "ANSWERING", answers: {} });
  }, []);

  const requestHint = useCallback(
    (questionId: string) => {
      setHintState((prev) => {
        if (prev.hints[questionId] || prev.loadingQuestionId === questionId) return prev;
        return { ...prev, loadingQuestionId: questionId, errorQuestionId: null };
      });

      requestAiHint()
        .then((hint) => {
          setHintState((prev) => ({
            hints: { ...prev.hints, [questionId]: hint },
            loadingQuestionId: null,
            errorQuestionId: null,
          }));
        })
        .catch(() => {
          setHintState((prev) => ({
            ...prev,
            loadingQuestionId: null,
            errorQuestionId: questionId,
          }));
        });
    },
    [],
  );

  return {
    state,
    currentIndex,
    answers,
    submitError,
    isConfirmingSubmit,
    hintState,
    start,
    answer,
    goNext,
    goPrevious,
    requestSubmit,
    cancelSubmit,
    confirmSubmit,
    retry,
    returnToIntro,
    reviewPreviousAttempt,
    requestHint,
  };
}
