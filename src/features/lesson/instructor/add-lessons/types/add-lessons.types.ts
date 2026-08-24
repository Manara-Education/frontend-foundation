/**
 * The instructor course editor screen no longer owns a course model of its own.
 *
 * It drives the shared editor in `@/features/course/Instructor/course-editor`, which
 * holds the state model, the aggregate endpoints (`POST`/`GET`/`PUT
 * /api/v1/instructor/courses`) and the DTO mapping. The scoped lesson endpoints this
 * screen used to call are gone from it — a lesson is now part of the course payload.
 */
export type { CourseTab } from "../hooks/use-add-lessons";

export type {
  CourseEditorState,
  CourseLessonEditorState,
  CourseModuleEditorState,
  QuizEditorState,
} from "@/shared/courses";

export type {
  CourseEditorErrors,
  LessonDraft,
  ModuleDraft,
} from "@/features/course/Instructor/course-editor/types/course-editor.types";
