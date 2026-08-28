import {
  normalizeAccessStatus,
  normalizeCourseAccessType,
  normalizeCourseStructure,
  type ContentChangeResponse,
  type CourseAccessResponse,
  type SubscriptionPlanResponse,
} from "@/shared/courses";
import { toQuizView } from "@/features/quiz/student/quiz-player";
import {
  formatAccessEndDate,
  formatPlanDuration,
  formatPrice,
  toLessonStatus,
} from "../formatters/course-details.formatter";
import type {
  ContentChange,
  CourseAccess,
  CourseDetailsApiResponse,
  CourseModuleApi,
  CurriculumModule,
  Lesson,
  LessonApi,
  StudentCourseModel,
  SubscriptionPlanOption,
} from "../types/course-details.types";
import { UNCHANGED } from "../types/course-details.types";

/**
 * The server's verdict on one row, or "nothing to say".
 *
 * The fallback covers three cases that must all render the same way: a viewer with no
 * enrolment, a backend that predates the field, and a row the server explicitly called
 * unchanged. None of them gets a badge, and the mapper never decides which is which — a
 * missing verdict is not a reason to invent one.
 */
function toChange(dto: ContentChangeResponse | null | undefined): ContentChange {
  if (!dto || dto.state === "UNCHANGED") return UNCHANGED;
  return { state: dto.state, summary: dto.summary ?? null };
}

function byOrderIndex<T extends { orderIndex: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * `number` is the row's position in reading order, which is what the curriculum prints
 * beside a lesson. It is *not* what decides the row's state — that is `status`, which
 * comes entirely from the server.
 */
function toLesson(dto: LessonApi, number: number, nextLessonId: number | null): Lesson {
  return {
    id: dto.id,
    number,
    title: dto.title,
    duration: dto.duration ?? "",
    // Defaulted for a response written before the field existed, which described a video lesson.
    contentType: dto.contentType ?? "VIDEO",
    status: toLessonStatus(dto, nextLessonId),
    quiz: dto.quiz ? toQuizView(dto.quiz) : null,
    change: toChange(dto.change),
    // The lesson's quiz carries its own verdict. Folding it into the lesson's would mark a
    // row whose video has not moved, and send the learner looking for a change that is not
    // where the badge points.
    quizChange: toChange(dto.quiz?.change),
  };
}

function toModule(
  dto: CourseModuleApi,
  number: number,
  nextLessonId: number | null,
  numberOfFirstLesson: number,
): CurriculumModule {
  return {
    id: dto.id,
    number,
    title: dto.title,
    description: dto.description ?? "",
    locked: dto.locked ?? false,
    lessons: byOrderIndex(dto.lessons ?? []).map((lesson, i) =>
      toLesson(lesson, numberOfFirstLesson + i, nextLessonId),
    ),
    quiz: dto.quiz ? toQuizView(dto.quiz) : null,
    change: toChange(dto.change),
    quizChange: toChange(dto.quiz?.change),
  };
}

/**
 * Only the branch matching `structure` is populated, so the modules are walked once and
 * their lessons kept in both places: grouped for the module cards, flattened for
 * "continue learning" and for the browse list, which has no module of its own to show.
 */
function toModules(
  dto: CourseDetailsApiResponse,
  nextLessonId: number | null,
): CurriculumModule[] {
  let lessonNumber = 1;

  return byOrderIndex(dto.modules ?? []).map((module, index) => {
    const mapped = toModule(module, index + 1, nextLessonId, lessonNumber);
    lessonNumber += mapped.lessons.length;
    return mapped;
  });
}

function toPlanOption(dto: SubscriptionPlanResponse): SubscriptionPlanOption {
  return {
    id: dto.id,
    name: dto.name,
    durationLabel: formatPlanDuration(dto.duration, dto.unit),
    priceLabel: formatPrice(dto.price),
  };
}

/**
 * A response that predates the access block, or a viewer the course tracks nothing for,
 * both map to "no standing" — which is the same thing the backend sends for them.
 */
function toCourseAccess(dto: CourseAccessResponse | null | undefined): CourseAccess {
  return {
    enrolled: dto?.enrolled ?? false,
    entitled: dto?.entitled ?? false,
    source: dto?.source ?? null,
    status: normalizeAccessStatus(dto?.status),
    endDateLabel: formatAccessEndDate(dto?.expiresAt ?? null),
    daysRemaining: dto?.daysRemaining ?? null,
    planId: dto?.planId ?? null,
  };
}

export function mapCourseDetailsResponseToStudentCourseModel(
  dto: CourseDetailsApiResponse,
): StudentCourseModel {
  const { course, instructor } = dto;
  const nextLessonId = dto.nextLessonId ?? null;

  const modules = toModules(dto, nextLessonId);
  const flatLessons = byOrderIndex(dto.lessons ?? []).map((lesson, i) =>
    toLesson(lesson, i + 1, nextLessonId),
  );
  // A module course leaves `lessons` empty; the flattened modules are its reading order.
  const lessons = flatLessons.length > 0 ? flatLessons : modules.flatMap((m) => m.lessons);

  const completedLessons = lessons.filter((l) => l.status === "completed").length;
  const totalLessons = course.lessonCount ?? lessons.length;
  const currentLesson = lessons.find((l) => l.id === nextLessonId);
  const purchasePrice = course.purchasePrice ?? course.price ?? null;

  return {
    id: course.id,
    title: course.title,
    instructor: instructor.fullName,
    instructorTitle: instructor.specialization ?? "",
    instructorBio: instructor.bio ?? "",
    instructorStudents: 0,
    instructorCourses: 0,
    instructorImage: "",
    description: course.description ?? "",
    outcomes: [],
    skills: [],
    image: course.image ?? "",
    // The server's own figure: exams gate what opens next, they do not move this bar.
    progress: dto.progress ?? 0,
    totalLessons,
    completedLessons,
    totalDuration: course.duration ?? "",
    remainingDuration: course.remainingDuration ?? "",
    students: course.studentsCount ?? 0,
    rating: 0,
    category: course.subtitle ?? "",
    price: purchasePrice,
    purchasePrice,
    purchasePriceLabel: purchasePrice === null ? null : formatPrice(purchasePrice),
    accessType: normalizeCourseAccessType(course.accessType),
    subscriptionPlans: byOrderIndex(course.subscriptionPlans ?? []).map(toPlanOption),
    access: toCourseAccess(dto.access),
    structure: normalizeCourseStructure(dto.structure),
    currentLesson: {
      number: currentLesson?.number ?? 0,
      title: currentLesson?.title ?? "",
      remaining: course.remainingDuration ?? "",
    },
    lessons,
    modules,
    finalQuiz: dto.finalQuiz ? toQuizView(dto.finalQuiz) : null,
    courseCompleted: dto.courseCompleted ?? false,
    nextLessonId,
    // A backend that predates the field sends nothing, which reads as "no updates".
    hasUpdatesSinceEnrollment: course.hasUpdatesSinceEnrollment === true,
    finalQuizChange: toChange(dto.finalQuiz?.change),
    removedContent: dto.removedContent ?? [],
  };
}
