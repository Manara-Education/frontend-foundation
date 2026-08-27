import type { ContentChange } from "../types/course-details.types";
import {
  CheckCircle2, ClipboardList, Play, PlayCircle, Lock,
} from "lucide-react";
import type { QuizView } from "@/features/quiz/student/quiz-player";
import type { SubscriptionUnit } from "@/shared/courses";
import type { LessonApi, LessonStatus } from "../types/course-details.types";

export const PRIMARY = "#4E5B92";
export const FONT = "'Cairo', sans-serif";
export const SUCCESS = "#22C55E";
export const WARNING = "#F59E0B";
export const BG = "#FAFAF7";

export const SHIMMER_CSS = `
  @keyframes cdv-shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .cdv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 700px 100%;
    animation: cdv-shimmer 1.9s ease-in-out infinite;
  }
`;

export interface LessonStatusConfig {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
}

export const LESSON_STATUS_CONFIG: Record<LessonStatus, LessonStatusConfig> = {
  completed:     { icon: CheckCircle2, color: SUCCESS,   bg: "rgba(34,197,94,0.10)",   label: "مكتمل" },
  current:       { icon: PlayCircle,   color: PRIMARY,   bg: "rgba(78,91,146,0.10)",   label: "قيد المشاهدة" },
  "not-started": { icon: Play,         color: "#9BA3C4", bg: "rgba(155,163,196,0.08)", label: "غير مكتمل" },
  locked:        { icon: Lock,         color: "#C4C9DE", bg: "rgba(196,201,222,0.06)", label: "مقفل" },
};

/**
 * The row's state, decided entirely by what the server sent.
 *
 * `locked` is the curriculum's own verdict, `isCompleted` the learner's record, and
 * `nextLessonId` the server's answer to "where do I go next" — a lesson's position in
 * the list says nothing about any of the three.
 */
export function toLessonStatus(lesson: LessonApi, nextLessonId: number | null): LessonStatus {
  if (lesson.locked) return "locked";
  if (lesson.isCompleted) return "completed";
  if (nextLessonId !== null && lesson.id === nextLessonId) return "current";
  return "not-started";
}

/** An exam row borrows the lesson row's states, so the curriculum reads as one list. */
export function toExamStatus(quiz: QuizView): LessonStatus {
  if (quiz.passed) return "completed";
  if (!quiz.available) return "locked";
  return "current";
}

export const EXAM_ICON = ClipboardList;

export function formatExamStatusLabel(quiz: QuizView): string {
  if (quiz.passed) return `تم الاجتياز · ${quiz.bestScore ?? 0}%`;
  if (!quiz.available) return "مقفل";
  return "متاح الآن";
}

export function formatQuestionCount(count: number): string {
  return `${count} سؤال`;
}

export function formatStudentsCount(n: number): string {
  return n.toLocaleString("ar-EG");
}

// ── Pricing and access ────────────────────────────────────────────────────────

/** Every amount on this screen — course price, plan price, pay button — reads the same. */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ar-EG")} ج.م`;
}

const SUBSCRIPTION_UNIT_LABELS: Record<SubscriptionUnit, string> = {
  DAY: "يوم",
  WEEK: "أسبوع",
  MONTH: "شهر",
};

/**
 * A plan's length, in the unit it is actually sold in.
 *
 * Deliberately not converted to days: a month is a calendar month to the backend, which
 * computes the expiry, and printing "٣٠ يوم" for it would be this screen inventing a figure
 * the server never agreed to.
 */
export function formatPlanDuration(duration: number, unit: SubscriptionUnit): string {
  return `${duration.toLocaleString("ar-EG")} ${SUBSCRIPTION_UNIT_LABELS[unit] ?? ""}`.trim();
}

/** The date a subscription ends, as the card prints it: `"٧ سبتمبر ٢٠٢٦"`. */
export function formatAccessEndDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Whether checkout can be submitted.
 *
 * `formatCardNumber`, `formatExpiry` and `sanitizeCvc` used to live here and were removed with
 * the fields they shaped. The 16-digit and CVC-length checks that used to gate this went with
 * them: validating the shape of a card number is only worth doing when something is going to
 * charge it, and nothing here ever was.
 */
export function isCheckoutValid(state: { name: string }, isFree: boolean): boolean {
  if (isFree) return true;
  return state.name.trim().length > 0;
}

/**
 * The louder of two verdicts about one curriculum row.
 *
 * A lesson and the quiz hanging off it each carry their own state, and a row that showed
 * both would be two badges wide in a list that is already dense. So the row shows one, and
 * this decides which: `NEW` outranks `UPDATED`, and a tie keeps the first — which is the
 * lesson's own, because "this lesson changed" is the more useful thing to read when both
 * did.
 *
 * The summary travels with the verdict that won, so a row lit by its quiz explains itself
 * as "تم تحديث الاختبار القصير" rather than claiming the video moved.
 */
export function louderChange(first: ContentChange, second: ContentChange): ContentChange {
  const rank = (change: ContentChange) =>
    change.state === "NEW" ? 2 : change.state === "UPDATED" ? 1 : 0;
  return rank(second) > rank(first) ? second : first;
}
