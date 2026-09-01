import type { QuizKind } from "../types/quiz-player.types";

export const PRIMARY = "#4E5B92";
export const SUCCESS = "#22C55E";
export const DANGER = "#D4183D";
export const FONT = "'Cairo', sans-serif";

/**
 * The only place the three owners differ in wording.
 *
 * Lesson wording is the reference player's verbatim copy. Module and final wording are
 * the same sentences retargeted at the thing being unlocked, because the reference
 * prototype only ever had a lesson quiz.
 */
export interface QuizKindCopy {
  /** Header above the player. */
  sectionTitle: string;
  /** Subtitle of the passed-result card. */
  passSubtitle: string;
  /** Primary action of the passed-result card. */
  passActionLabel: string;
  /** Subtitle of the failed-result card. */
  failSubtitle: string;
  /** Secondary action of the failed-result card. */
  failReturnLabel: string;
  /** Shown instead of the player while the curriculum still gates the quiz. */
  lockedTitle: string;
  lockedSubtitle: string;
}

const QUIZ_KIND_COPY: Record<QuizKind, QuizKindCopy> = {
  LESSON: {
    sectionTitle: "اختبار الدرس",
    passSubtitle: "يمكنك الآن إكمال الدرس والمضي قدماً",
    passActionLabel: "إكمال الدرس",
    failSubtitle: "راجع محتوى الدرس ثم أعد المحاولة عندما تكون مستعداً.",
    failReturnLabel: "العودة إلى الدرس",
    lockedTitle: "اختبار الدرس غير متاح بعد",
    lockedSubtitle: "أكمل المحتوى المطلوب أولاً لفتح الاختبار.",
  },
  MODULE: {
    sectionTitle: "اختبار الوحدة",
    passSubtitle: "يمكنك الآن متابعة الوحدة التالية والمضي قدماً",
    passActionLabel: "متابعة المنهج",
    failSubtitle: "راجع محتوى الوحدة ثم أعد المحاولة عندما تكون مستعداً.",
    failReturnLabel: "العودة إلى الوحدة",
    lockedTitle: "اختبار الوحدة غير متاح بعد",
    lockedSubtitle: "أكمل جميع دروس الوحدة أولاً لفتح الاختبار.",
  },
  FINAL: {
    sectionTitle: "الاختبار النهائي",
    passSubtitle: "يمكنك الآن إنهاء الدورة والمضي قدماً",
    passActionLabel: "متابعة المنهج",
    failSubtitle: "راجع محتوى الدورة ثم أعد المحاولة عندما تكون مستعداً.",
    failReturnLabel: "العودة إلى الدورة",
    lockedTitle: "الاختبار النهائي غير متاح بعد",
    lockedSubtitle: "أكمل جميع دروس الدورة أولاً لفتح الاختبار.",
  },
};

export function getQuizKindCopy(kind: QuizKind): QuizKindCopy {
  return QUIZ_KIND_COPY[kind];
}

const ARABIC_OPTION_LETTERS = ["أ", "ب", "ج", "د", "هـ"] as const;

/** Arabic option letters beside each option, so the marker reads naturally in RTL. */
export function formatOptionLetter(index: number): string {
  return ARABIC_OPTION_LETTERS[index] ?? String(index + 1);
}

export function formatScorePercent(score: number): string {
  return `${score}%`;
}
