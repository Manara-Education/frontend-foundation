/**
 * The lesson player reads the canonical lesson DTOs. `LessonResponse.quiz` is the
 * learner view, which has no answer key — the quiz player scores through the backend
 * rather than client-side.
 */
export type {
  CourseDetailsResponse,
  LessonCompletionResponse,
  LessonDetailsResponse,
  LessonRef,
  LessonResponse,
} from "@/shared/courses";

// ── Domain / view shape ───────────────────────────────────────────────────────
import type { ContentChangeResponse, LessonContentType, LessonRef } from "@/shared/courses";
import type { RichDocument } from "@/shared/rich-content";
import type { QuizView } from "@/features/quiz/student/quiz-player";
import type { VideoSource } from "@/shared/video";

export type LessonStatus = "completed" | "current" | "not-started" | "locked";

export interface LessonView {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: LessonStatus;
  /**
   * What this lesson teaches with, and the only thing the player branches on.
   *
   * Taken from the server's own field rather than inferred from whether `video` came back null. The
   * difference matters: a video lesson whose URL Manara cannot parse also has a null `video`, and
   * it must show "this video is unavailable" rather than an empty article.
   */
  contentType: LessonContentType;
  /**
   * The lesson's video, resolved once here so no screen or player parses a URL of its own.
   *
   * Null for a locked lesson — the backend withholds the video entirely — for a rich-content
   * lesson, which has none, and for a link Manara cannot place, which the player renders as its
   * unavailable state rather than an empty frame.
   */
  video: VideoSource | null;
  /**
   * The authored document, parsed. Empty for a video lesson and for a locked one.
   */
  richContent: RichDocument;
  description: string;
  /**
   * True when the curriculum has not opened this lesson. The request still succeeds —
   * the backend answers with the row's title and position and withholds the content —
   * so this, not the HTTP status, is what says whether the lesson may be played.
   */
  locked: boolean;
  /** The lesson's quiz, or `null` when it has none or the lesson is locked. */
  quiz: QuizView | null;
  previousLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  /**
   * Whether this lesson is new or updated relative to when this learner enrolled, and what to say
   * about it — the server's decision, not a comparison made here.
   *
   * Null for a viewer with no enrollment to measure against.
   */
  change: ContentChangeResponse | null;
}

/**
 * The course the lesson belongs to, reduced to what the player's header prints: its name
 * and how far through it the learner is.
 *
 * The lesson endpoint answers with the lesson alone, so this is read from the course
 * endpoint — the same figures the course details screen shows, not a second count.
 */
export interface LessonCourseSummary {
  id: number;
  title: string;
  /** Lessons in the course, as the server counts them. */
  totalLessons: number;
  /** How many of those this learner has finished. */
  completedLessons: number;
  /** The server's own percentage, 0–100, or `null` when it reported none. */
  progress: number | null;
  /**
   * The lessons of this course the curriculum has not opened for this learner, by id.
   *
   * The lesson endpoint's `previous`/`next` carry an id and a title and nothing else, so
   * whether the lesson the rail offers next is still shut is read from the course's own
   * curriculum — the same `locked` flag the course details screen prints.
   */
  lockedLessonIds: number[];
}

/** What completing a lesson changed, as the server reported it. */
export interface LessonCompletion {
  lessonId: number;
  completed: boolean;
  /** Percentage of the course's lessons now complete, 0–100. */
  courseProgress: number;
  /** The lesson to open next, or `null` when nothing is left to open. */
  nextLessonId: number | null;
  courseCompleted: boolean;
}
