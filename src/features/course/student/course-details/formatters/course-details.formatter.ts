import {
  CheckCircle2, ClipboardList, Play, PlayCircle, Lock,
} from "lucide-react";
import type { QuizView } from "@/features/quiz/student/quiz-player";
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

export function formatCardNumber(v: string): string {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

export function sanitizeCvc(v: string): string {
  return v.replace(/\D/g, "").slice(0, 4);
}

export function isCheckoutValid(state: {
  cardNumber: string; expiry: string; cvc: string; name: string;
}, isFree: boolean): boolean {
  if (isFree) return true;
  return (
    state.name.trim().length > 0 &&
    state.cardNumber.replace(/\s/g, "").length === 16 &&
    state.expiry.length >= 4 &&
    state.cvc.length >= 3
  );
}
