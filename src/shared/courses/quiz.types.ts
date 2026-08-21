/**
 * Quiz contracts, mirroring the backend `quiz` package.
 *
 * There is one quiz domain: a lesson quiz, a module exam and a course final exam are
 * the same shape with a different owner. What differs is the *audience*:
 *
 * - {@link InstructorQuizResponse} carries the answer key (`correctOptionId`, `explanation`).
 * - {@link LearnerQuizResponse} has no field capable of carrying one.
 *
 * They are separate types rather than one type with optional fields on purpose — a
 * learner model must not be able to hold an answer key even by accident.
 */

// ── Requests (authoring) ──────────────────────────────────────────────────────

export interface QuizOptionRequest {
  /**
   * Required and unique within its question — this is what `correctOptionId` resolves
   * against. Use the persisted id for an existing option, or any client-generated
   * reference for a new one.
   */
  id: string;
  text: string;
  /** Accepted for round-tripping; the array position is what the backend stores. */
  orderIndex?: number;
}

export interface QuizQuestionRequest {
  id: string;
  text: string;
  /** Must reference an option of *this* question. */
  correctOptionId: string;
  explanation?: string | null;
  hintByAiEnabled?: boolean;
  /** Accepted for round-tripping; the array position is what the backend stores. */
  orderIndex?: number;
  options: QuizOptionRequest[];
}

export interface QuizRequest {
  /** Accepted for symmetry with the response; a quiz is identified by its owner. */
  id?: string;
  title: string;
  instructions?: string | null;
  passingScore: number;
  questions: QuizQuestionRequest[];
}

// ── Responses ─────────────────────────────────────────────────────────────────

/**
 * Shared by both audiences because it genuinely is the same data: an option carries no
 * answer information.
 */
export interface QuizOptionResponse {
  id: string;
  text: string;
  orderIndex: number;
}

/** A question as seen by its author — carries the answer key and the explanation. */
export interface InstructorQuizQuestionResponse {
  id: string;
  text: string;
  /** Persisted id of the correct option, ready to send straight back on the next update. */
  correctOptionId: string | null;
  explanation: string | null;
  hintByAiEnabled: boolean | null;
  orderIndex: number;
  options: QuizOptionResponse[];
}

/** Authoring view. Only ever returned from instructor endpoints. */
export interface InstructorQuizResponse {
  id: string;
  title: string;
  instructions: string | null;
  passingScore: number | null;
  questions: InstructorQuizQuestionResponse[];
}

/**
 * A question as presented to a learner before submission.
 *
 * Neither `correctOptionId` nor `explanation` exists here — both belong to the result of
 * an attempt, which is {@link QuizAttemptAnswerResponse}.
 */
export interface LearnerQuizQuestionResponse {
  id: string;
  text: string;
  hintByAiEnabled: boolean | null;
  orderIndex: number;
  options: QuizOptionResponse[];
}

/** Learner view: everything needed to attempt the quiz, and nothing that gives it away. */
export interface LearnerQuizResponse {
  id: string;
  title: string;
  instructions: string | null;
  passingScore: number | null;
  questions: LearnerQuizQuestionResponse[];
  /**
   * Where this learner stands on the quiz — whether the curriculum has opened it, and
   * how earlier attempts went. `null` when the viewer is not a learner of the course.
   */
  state: LearnerQuizStateResponse | null;
}

// ── Learner progression state ─────────────────────────────────────────────────

/**
 * Where one learner stands on one quiz: whether they may take it yet, and how their
 * past attempts went.
 *
 * This is what lets the quiz screen open in the right state without the client deriving
 * progression rules of its own — `available` answers "is this exam still locked", and
 * `passed` plus `bestScore` answer "have I already cleared this".
 *
 * Carries no answer key: it summarises results, it does not review them. The review
 * belongs to {@link QuizAttemptResponse}, which only a submission produces.
 */
export interface LearnerQuizStateResponse {
  /** `false` while the progression rules still gate this quiz. */
  available: boolean | null;
  attemptCount: number | null;
  passed: boolean | null;
  /** Highest score reached so far, or `null` when the learner has not attempted it. */
  bestScore: number | null;
  lastAttemptId: number | null;
  lastSubmittedAt: string | null;
}

// ── Attempts (taking a quiz) ──────────────────────────────────────────────────

/**
 * One answer of a submission: the question, and the option chosen for it.
 *
 * Nothing else is accepted — no score, no correctness flag — because the server reads
 * the answer key from its own rows.
 */
export interface QuizAnswerRequest {
  questionId: string;
  optionId: string;
}

/**
 * A learner's completed quiz. The payload carries answers and nothing else: a score, a
 * pass flag or an answer key sent by a client would be ignored, and there is
 * deliberately no field able to receive one.
 */
export interface QuizSubmissionRequest {
  answers: QuizAnswerRequest[];
}

/**
 * One question of a graded attempt, as returned *after* submission.
 *
 * This is the only learner-facing type that carries a correct answer, and it exists only
 * inside {@link QuizAttemptResponse} — a value produced by grading a submission and by
 * nothing else.
 */
export interface QuizAttemptAnswerResponse {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  correct: boolean | null;
  /** The instructor's explanation, when they wrote one. */
  explanation: string | null;
}

/**
 * The graded result of one submission.
 *
 * Everything the result screen needs is server-computed and present here — the score,
 * the pass mark it was measured against, the verdict, and the per-question review — so
 * the client never holds an answer key or reproduces a scoring rule to render it.
 */
export interface QuizAttemptResponse {
  quizId: string;
  attemptId: number;
  /** `1` for the learner's first submission of this quiz. */
  attemptNumber: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
  /** Percentage answered correctly, 0–100. */
  score: number | null;
  passingScore: number | null;
  passed: boolean | null;
  submittedAt: string | null;
  answers: QuizAttemptAnswerResponse[] | null;
}
