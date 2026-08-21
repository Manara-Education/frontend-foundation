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
 * Neither `correctOptionId` nor `explanation` exists here — both belong to the result
 * of an attempt, which the backend does not model yet.
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
}
