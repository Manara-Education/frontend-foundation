export { getMyCoursesRequest } from "./courses.api";
export { getMyCourses } from "./courses.service";

export {
  COURSE_ACCESS_TYPES,
  COURSE_STATUSES,
  COURSE_STRUCTURES,
  SUBSCRIPTION_UNITS,
  normalizeCourseAccessType,
  normalizeCourseStatus,
  normalizeCourseStructure,
} from "./courses.enums";
export type {
  CourseAccessType,
  CourseStatus,
  CourseStructure,
  SubscriptionUnit,
} from "./courses.enums";

export type {
  CheckoutRequest,
  CourseDetailsInfo,
  CourseDetailsInstructorInfo,
  CourseDetailsResponse,
  CourseModuleRequest,
  CourseRequest,
  CourseResponse,
  CourseViewMode,
  EnrollmentResponse,
  InstructorCourseModuleResponse,
  InstructorCourseResponse,
  InstructorLessonResponse,
  LearnerCourseModuleResponse,
  LessonCompletionResponse,
  LessonDetailsResponse,
  LessonRef,
  LessonRequest,
  LessonResponse,
  SubscriptionPlanRequest,
  SubscriptionPlanResponse,
} from "./courses.types";

export type {
  InstructorQuizQuestionResponse,
  InstructorQuizResponse,
  LearnerQuizQuestionResponse,
  LearnerQuizResponse,
  LearnerQuizStateResponse,
  QuizAnswerRequest,
  QuizAttemptAnswerResponse,
  QuizAttemptResponse,
  QuizOptionRequest,
  QuizOptionResponse,
  QuizQuestionRequest,
  QuizRequest,
  QuizSubmissionRequest,
} from "./quiz.types";

export type {
  CourseCardModel,
  CourseEditorState,
  CourseLessonEditorState,
  CourseModuleEditorState,
  QuizEditorState,
  QuizOptionEditorState,
  QuizQuestionEditorState,
  SubscriptionPlanEditorState,
} from "./courses.models";

export {
  createEditorKey,
  createEmptyCourseEditorState,
  mapCourseEditorStateToCourseRequest,
  mapCourseResponseToCourseCardModel,
  mapInstructorCourseResponseToEditorState,
} from "./courses.mappers";
