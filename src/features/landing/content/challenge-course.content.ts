/**
 * Approved marketing copy for the challenge-course card.
 *
 * Sections 1 (Hero) and 6 (Product experience) render the very same card, so
 * the copy is defined once here and imported by `ChallengeCourseCard` rather
 * than duplicated at either call site.
 */

export interface ChallengeCourseItem {
  title: string;
  done?: boolean;
  active?: boolean;
  locked?: boolean;
  quiz?: boolean;
}

export interface ChallengeCourseContent {
  label: string;
  statement: string;
  progressLabel: string;
  progressPercent: number;
  progressPercentLabel: string;
  lessonsLabel: string;
  activeBadge: string;
  items: ChallengeCourseItem[];
}

export const CHALLENGE_COURSE: ChallengeCourseContent = {
  label: "دورة تحدي",
  statement: "غير طريقة تفكيرك.... بتغير مستقبلك.",
  progressLabel: "التقدم الكلي",
  progressPercent: 72,
  progressPercentLabel: "٧٢٪",
  lessonsLabel: "١٨ / ٢٥ درس",
  activeBadge: "جارٍ الآن",
  items: [
    { title: "بناء شخصيتك",              done: true },
    { title: "عادات يومية دائمة",         done: true },
    { title: "فن التواصل مع الآخرين",     done: false, active: true },
    { title: "مهارات المستقبل",           done: false, locked: true },
    { title: "الدراسة رحلة ممتعة... ممكن؟", done: false, locked: true },
    { title: "لغز الذاكرة",                done: false, locked: true, quiz: true },
  ],
};
