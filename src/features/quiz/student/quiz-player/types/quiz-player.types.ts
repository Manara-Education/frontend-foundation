/**
 * One quiz player, three owners.
 *
 * A lesson quiz, a module exam and a course final exam are the same quiz domain with a
 * different owner, so they share this one set of view shapes and one player. What varies
 * between them is wording and what passing unlocks — both passed in as props, never
 * branched on inside the player's own rendering.
 *
 * The DTOs are the canonical learner contracts from `@/shared/courses`: the pre-submit
 * view has no field able to carry an answer key, and the post-submit review comes from
 * the graded attempt the backend returns.
 */
export type {
  LearnerQuizQuestionResponse,
  LearnerQuizResponse,
  LearnerQuizStateResponse,
  QuizAnswerRequest,
  QuizAttemptAnswerResponse,
  QuizAttemptResponse,
  QuizSubmissionRequest,
} from "@/shared/courses";

/** Which owner a quiz belongs to. Decides wording and what the pass action does. */
export type QuizKind = "LESSON" | "MODULE" | "FINAL";

// ── Domain / view shapes ──────────────────────────────────────────────────────

export interface QuizOptionView {
  id: string;
  text: string;
}

export interface QuizQuestionView {
  id: string;
  text: string;
  hintByAiEnabled: boolean;
  options: QuizOptionView[];
}

/**
 * A quiz as the learner sees it before submitting, together with where the server says
 * they stand on it.
 *
 * `available`, `passed` and `bestScore` are the backend's answers, not derived here —
 * the player opens in the state the curriculum decided.
 */
export interface QuizView {
  id: string;
  title: string;
  instructions: string;
  passingScore: number;
  questions: QuizQuestionView[];
  /** False while the progression rules still gate this quiz. */
  available: boolean;
  attemptCount: number;
  passed: boolean;
  /** Highest score reached so far, or `null` when never attempted. */
  bestScore: number | null;
}

/** One reviewed question of a graded attempt, joined with the texts the quiz carries. */
export interface QuizResultAnswerView {
  questionId: string;
  questionText: string;
  selectedOptionText: string;
  correctOptionText: string;
  correct: boolean;
  explanation: string;
}

/**
 * The graded attempt, ready to render. Every number here was computed by the backend —
 * the client neither scores nor compares against the pass mark.
 */
export interface QuizResultView {
  attemptId: number;
  attemptNumber: number;
  score: number;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  answers: QuizResultAnswerView[];
}

// ── Player state ──────────────────────────────────────────────────────────────

/**
 * The player's whole state.
 *
 * `RESULT` can only be reached by a server response, which is what keeps scoring off the
 * client: there is no transition from `ANSWERING` to a result the frontend computed.
 */
export type QuizPlayerState =
  | { status: "LOCKED" }
  | { status: "PREVIOUSLY_PASSED" }
  | { status: "INTRO" }
  | { status: "ANSWERING"; answers: Record<string, string> }
  | { status: "SUBMITTING"; answers: Record<string, string> }
  | { status: "RESULT"; result: QuizResultView };

/** Per-question AI hint state, which the reference surfaces inside the taking screen. */
export interface QuizHintState {
  hints: Record<string, string>;
  loadingQuestionId: string | null;
  errorQuestionId: string | null;
}
