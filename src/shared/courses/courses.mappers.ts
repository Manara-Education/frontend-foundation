/**
 * The mapping boundary between the course API and the app.
 *
 * Backend DTO → mapper → view model → UI. Nothing outside this file should read a
 * course DTO field directly, which is what keeps the deprecated `price` and the
 * "everything is nullable" reality of the API from leaking into features.
 */
import {
  normalizeCourseAccessType,
  normalizeCourseStatus,
  normalizeCourseStructure,
} from "./courses.enums";
import type {
  CourseEditorState,
  CourseLessonEditorState,
  CourseModuleEditorState,
  QuizEditorState,
  SubscriptionPlanEditorState,
} from "./courses.models";
import type { CourseCardModel } from "./courses.models";
import type {
  CourseModuleRequest,
  CourseRequest,
  CourseResponse,
  InstructorCourseResponse,
  InstructorLessonResponse,
  LessonRequest,
  SubscriptionPlanRequest,
  SubscriptionPlanResponse,
} from "./courses.types";
import type { InstructorQuizResponse, QuizRequest } from "./quiz.types";

/** Client-side key for list items the backend has not assigned an id to yet. */
function editorKey(): string {
  return Math.random().toString(36).slice(2, 9);
}

function optional(value: string | null | undefined): string | undefined {
  return value ?? undefined;
}

function optionalNumber(value: number | null | undefined): number | undefined {
  return value ?? undefined;
}

// ── List / card ───────────────────────────────────────────────────────────────

/** The cheapest plan of an inlined set, or `undefined` when none was sent. */
function minSubscriptionPrice(
  plans: SubscriptionPlanResponse[] | null | undefined,
): number | undefined {
  if (!plans?.length) return undefined;
  return Math.min(...plans.map((plan) => plan.price));
}

/**
 * `CourseResponse` → the shape the course cards render.
 *
 * `price` collapses the deprecated field and `purchasePrice` into a single number,
 * defaulting to `0`, because the backend sends `null` for `FREE` and `SUBSCRIPTION`
 * courses and the cards read it as "0 means free".
 */
export function mapCourseResponseToCourseCardModel(dto: CourseResponse): CourseCardModel {
  return {
    id: dto.id,
    title: dto.title,
    subtitle: optional(dto.subtitle),
    image: optional(dto.image),
    description: optional(dto.description),
    duration: optionalNumber(dto.duration),
    lessonCount: optionalNumber(dto.lessonCount),
    price: dto.purchasePrice ?? dto.price ?? 0,
    purchasePrice: dto.purchasePrice ?? dto.price ?? null,
    accessType: normalizeCourseAccessType(dto.accessType),
    structure: normalizeCourseStructure(dto.structure),
    status: normalizeCourseStatus(dto.status),
    studentsCount: optionalNumber(dto.studentsCount),
    instructorId: dto.instructorId,
    instructorName: optional(dto.instructorName),
    createdAt: dto.createdAt,
    // A list payload that predates `updatedAt` still has a date worth printing, so the
    // card falls back to the creation date rather than losing the line entirely.
    updatedAt: optional(dto.updatedAt) ?? dto.createdAt,
    subscriptionMinPrice: minSubscriptionPrice(dto.subscriptionPlans),
    // A backend that predates the field sends nothing, and "nothing" has to read as "no
    // updates": showing the badge on every course would be worse than showing it on none.
    hasUpdatesSincePublish: dto.hasUpdatesSincePublish === true,
  };
}

// ── Editor: response → state ──────────────────────────────────────────────────

function mapInstructorQuizResponseToEditorState(
  dto: InstructorQuizResponse | null,
): QuizEditorState | null {
  if (!dto) return null;

  return {
    id: dto.id,
    title: dto.title ?? "",
    instructions: dto.instructions ?? "",
    passingScore: dto.passingScore ?? 0,
    questions: (dto.questions ?? []).map((question) => ({
      id: question.id,
      text: question.text ?? "",
      correctOptionId: question.correctOptionId ?? "",
      explanation: question.explanation ?? "",
      hintByAiEnabled: question.hintByAiEnabled ?? false,
      options: (question.options ?? []).map((option) => ({
        id: option.id,
        text: option.text ?? "",
      })),
    })),
  };
}

function mapInstructorLessonResponseToEditorState(
  dto: InstructorLessonResponse,
): CourseLessonEditorState {
  return {
    key: String(dto.id),
    id: dto.id,
    title: dto.title ?? "",
    summary: dto.summary ?? "",
    description: dto.description ?? "",
    videoUrl: dto.videoUrl ?? "",
    videoThumbnailUrl: dto.videoThumbnailUrl ?? null,
    quiz: mapInstructorQuizResponseToEditorState(dto.quiz),
  };
}

function mapSubscriptionPlanResponseToEditorState(
  dto: SubscriptionPlanResponse,
): SubscriptionPlanEditorState {
  return {
    key: String(dto.id),
    id: dto.id,
    name: dto.name ?? "",
    duration: dto.duration ?? 1,
    unit: dto.unit ?? "MONTH",
    price: dto.price ?? 0,
  };
}

/**
 * `InstructorCourseResponse` → editor state.
 *
 * The response populates only the branch matching `structure`; the other one comes back
 * empty so the editor can switch to it without carrying stale content.
 */
export function mapInstructorCourseResponseToEditorState(
  dto: InstructorCourseResponse,
): CourseEditorState {
  const modules: CourseModuleEditorState[] = (dto.modules ?? []).map((module) => ({
    key: String(module.id),
    id: module.id,
    title: module.title ?? "",
    description: module.description ?? "",
    lessons: (module.lessons ?? []).map(mapInstructorLessonResponseToEditorState),
    quiz: mapInstructorQuizResponseToEditorState(module.quiz),
  }));

  return {
    id: dto.id,
    title: dto.title ?? "",
    subtitle: dto.subtitle ?? "",
    description: dto.description ?? "",
    image: dto.image ?? "",
    duration: dto.duration ?? null,
    structure: normalizeCourseStructure(dto.structure),
    lessons: (dto.lessons ?? []).map(mapInstructorLessonResponseToEditorState),
    modules,
    finalQuiz: mapInstructorQuizResponseToEditorState(dto.finalQuiz),
    accessType: normalizeCourseAccessType(dto.accessType),
    purchasePrice: dto.purchasePrice ?? dto.price ?? null,
    subscriptionPlans: (dto.subscriptionPlans ?? []).map(mapSubscriptionPlanResponseToEditorState),
    status: normalizeCourseStatus(dto.status),
    hasUpdatesSincePublish: dto.hasUpdatesSincePublish === true,
  };
}

// ── Editor: state → request ───────────────────────────────────────────────────

function mapQuizEditorStateToRequest(state: QuizEditorState | null): QuizRequest | null {
  if (!state) return null;

  return {
    ...(state.id !== null ? { id: state.id } : {}),
    title: state.title,
    instructions: state.instructions,
    passingScore: state.passingScore,
    questions: state.questions.map((question, index) => ({
      id: question.id,
      text: question.text,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
      hintByAiEnabled: question.hintByAiEnabled,
      orderIndex: index,
      options: question.options.map((option, optionIndex) => ({
        id: option.id,
        text: option.text,
        orderIndex: optionIndex,
      })),
    })),
  };
}

function mapLessonEditorStateToRequest(
  state: CourseLessonEditorState,
  index: number,
): LessonRequest {
  return {
    ...(state.id !== null ? { id: state.id } : {}),
    title: state.title,
    summary: state.summary,
    description: state.description,
    videoUrl: state.videoUrl,
    orderIndex: index,
    quiz: mapQuizEditorStateToRequest(state.quiz),
  };
}

function mapModuleEditorStateToRequest(
  state: CourseModuleEditorState,
  index: number,
): CourseModuleRequest {
  return {
    ...(state.id !== null ? { id: state.id } : {}),
    title: state.title,
    description: state.description,
    orderIndex: index,
    lessons: state.lessons.map(mapLessonEditorStateToRequest),
    quiz: mapQuizEditorStateToRequest(state.quiz),
  };
}

function mapSubscriptionPlanEditorStateToRequest(
  state: SubscriptionPlanEditorState,
): SubscriptionPlanRequest {
  return {
    ...(state.id !== null ? { id: state.id } : {}),
    name: state.name,
    duration: state.duration,
    unit: state.unit,
    price: state.price,
  };
}

/**
 * Editor state → `CourseRequest`.
 *
 * Only the content branch matching `structure` is sent: the backend rejects a payload
 * that carries lessons for a module course or the other way round. Pricing follows the
 * same rule — `purchasePrice` only for `PURCHASE`, plans only for `SUBSCRIPTION` — so a
 * course that switched away from one does not keep submitting the other's fields.
 *
 * `duration` is not sent at all. It is the sum of the lessons' running times, which only
 * the video providers know and only the server computes; echoing the server's own figure
 * back at it was never useful, and it is what used to make a course unsaveable — the
 * aggregate came back with `duration: 0` for videos that had not been measured yet, and
 * the API rejected the very number it had just sent.
 */
export function mapCourseEditorStateToCourseRequest(
  state: CourseEditorState,
  options: { includeStatus?: boolean } = {},
): CourseRequest {
  const isModules = state.structure === "MODULES";

  return {
    title: state.title.trim(),
    subtitle: state.subtitle.trim() || null,
    image: state.image.trim() || null,
    description: state.description.trim(),
    structure: state.structure,
    ...(isModules
      ? { modules: state.modules.map(mapModuleEditorStateToRequest) }
      : { lessons: state.lessons.map(mapLessonEditorStateToRequest) }),
    finalQuiz: mapQuizEditorStateToRequest(state.finalQuiz),
    accessType: state.accessType,
    purchasePrice: state.accessType === "PURCHASE" ? state.purchasePrice : null,
    ...(state.accessType === "SUBSCRIPTION"
      ? { subscriptionPlans: state.subscriptionPlans.map(mapSubscriptionPlanEditorStateToRequest) }
      : {}),
    // Only a create says what the course's publication state should be. On update the
    // field is left out entirely, which is what tells the backend to leave publication
    // alone — publishing and unpublishing are their own endpoints, so a save built from a
    // stale copy of the course can no longer take a live course off the catalogue.
    ...(options.includeStatus ? { status: state.status } : {}),
  };
}

/** A blank editor state, for the "create a course" entry point. */
export function createEmptyCourseEditorState(): CourseEditorState {
  return {
    id: null,
    title: "",
    subtitle: "",
    description: "",
    image: "",
    duration: null,
    structure: "FLAT",
    lessons: [],
    modules: [],
    finalQuiz: null,
    accessType: "FREE",
    purchasePrice: null,
    subscriptionPlans: [],
    status: "DRAFT",
    hasUpdatesSincePublish: false,
  };
}

export { editorKey as createEditorKey };
