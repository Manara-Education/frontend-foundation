/**
 * Course view models — what features and UI consume.
 *
 * These are deliberately *not* the API DTOs. A backend response can leave almost every
 * field null (a `FREE` course has no `purchasePrice` at all), and the UI should never
 * have to know that. Mappers in `courses.mappers.ts` are the only place allowed to turn
 * one into the other.
 */
import type { CourseAccessType, CourseStatus, CourseStructure } from "./courses.enums";
import type { LessonContentType } from "./courses.types";
import type { SubscriptionUnit } from "./courses.enums";

// ── Course card ───────────────────────────────────────────────────────────────

/**
 * A course as shown in a list: instructor home, "all my courses", search results.
 *
 * Optional fields stay optional because the cards already branch on their absence;
 * `price` stays a plain number so the existing "مجانية vs. amount" rendering keeps
 * working now that the backend sends `null` for free and subscription courses.
 */
export interface CourseCardModel {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  description?: string;
  /** Estimated total duration in minutes. */
  duration?: number;
  lessonCount?: number;
  /**
   * Display price, `0` when the course is not a one-off purchase.
   *
   * @deprecated Kept so existing cards render unchanged. New pricing logic must read
   * `accessType` and `purchasePrice` instead — a `0` here means "free **or**
   * subscription", which those two fields tell apart.
   */
  price: number;
  purchasePrice: number | null;
  accessType: CourseAccessType;
  structure: CourseStructure;
  status: CourseStatus;
  studentsCount?: number;
  instructorId?: number;
  instructorName?: string;
  createdAt?: string;
  /**
   * When the course last changed, falling back to `createdAt` for a payload that does
   * not carry it — the same fallback the banner list already makes for its own rows.
   */
  updatedAt?: string;
  /**
   * Cheapest subscription plan of a `SUBSCRIPTION` course, or `undefined` when the list
   * payload did not inline the plans. The card then names the access type without a
   * price rather than inventing one.
   */
  subscriptionMinPrice?: number;
  /**
   * Whether learners should be told the course changed since it was last published.
   *
   * The backend's answer, carried through unchanged. No screen recomputes it.
   */
  hasUpdatesSincePublish: boolean;
}

// ── Course editor ─────────────────────────────────────────────────────────────

/**
 * A quiz being authored. Mirrors `QuizRequest`, but every field is filled in: the
 * editor always has a value to show, even for a quiz that has never been saved.
 */
export interface QuizEditorState {
  /** Persisted id, or `null` for a quiz that does not exist yet. */
  id: string | null;
  title: string;
  instructions: string;
  passingScore: number;
  questions: QuizQuestionEditorState[];
}

export interface QuizQuestionEditorState {
  /**
   * Persisted id, or a client-generated reference for a new question. Either way it is
   * what `correctOptionId` resolves against, so it must be stable within the quiz.
   */
  id: string;
  text: string;
  /** Id of the option in `options` that is correct; empty while unanswered. */
  correctOptionId: string;
  explanation: string;
  hintByAiEnabled: boolean;
  options: QuizOptionEditorState[];
}

export interface QuizOptionEditorState {
  id: string;
  text: string;
}

export interface CourseLessonEditorState {
  /** Stable key for list rendering and reordering. Never sent to the backend. */
  key: string;
  /** Persisted id, or `null` for a lesson that does not exist yet. */
  id: number | null;
  title: string;
  summary: string;
  description: string;
  /**
   * Which kind of lesson the instructor chose.
   *
   * Both content fields below are kept whatever this says, exactly as the server keeps both
   * columns: switching a lesson's type in the editor must not throw away what the other branch
   * already had, so switching back restores it. Only the branch matching this is sent as content.
   */
  contentType: LessonContentType;
  /** The address the instructor typed, on any supported platform. The only video field sent back. */
  videoUrl: string;
  /** The authored document for a `RICH_CONTENT` lesson, as JSON, or `null` if never authored. */
  richContent: string | null;
  /**
   * The still the server resolved for this video, carried so the editor's lesson cards can show a
   * Vimeo thumbnail — which, unlike YouTube's, has no address derivable from the URL.
   *
   * Read-only: it is filled from the response and never sent on write. A lesson whose URL has just
   * been changed has none until the server has looked the new video up.
   */
  videoThumbnailUrl: string | null;
  quiz: QuizEditorState | null;
}

export interface CourseModuleEditorState {
  key: string;
  id: number | null;
  title: string;
  description: string;
  lessons: CourseLessonEditorState[];
  quiz: QuizEditorState | null;
}

export interface SubscriptionPlanEditorState {
  key: string;
  id: number | null;
  name: string;
  duration: number;
  unit: SubscriptionUnit;
  price: number;
}

/**
 * Everything the course editor holds while a course is being created or edited.
 *
 * Both content branches are kept: switching `structure` in the UI must not throw away
 * what the other branch already had. Only the branch matching `structure` is sent.
 */
export interface CourseEditorState {
  /** `null` while the course has not been created yet. */
  id: number | null;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  /** Estimated total duration in minutes; `null` when the instructor left it blank. */
  duration: number | null;
  structure: CourseStructure;
  lessons: CourseLessonEditorState[];
  modules: CourseModuleEditorState[];
  finalQuiz: QuizEditorState | null;
  accessType: CourseAccessType;
  /** `null` unless `accessType` is `PURCHASE`. */
  purchasePrice: number | null;
  subscriptionPlans: SubscriptionPlanEditorState[];
  status: CourseStatus;
  /**
   * Whether the course this state was loaded from has changes its learners have not been told about.
   *
   * The backend's answer, carried through unchanged. No screen recomputes it.
   */
  hasUpdatesSincePublish: boolean;
  /**
   * The server revision this state was built from. `null` before the course exists.
   *
   * Sent back with every save and replaced by whatever the server answers with, so the editor
   * always holds the newest accepted revision — after an aggregate save, after a reorder, and
   * after publishing. Holding a stale one would make the next save conflict with nobody.
   */
  revision: number | null;
}
