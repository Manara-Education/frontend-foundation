/**
 * The create screen no longer carries a contract of its own.
 *
 * It drives the shared course editor (`@/features/course/Instructor/course-editor`),
 * which holds the state model, the aggregate endpoints and the DTO mapping. What is
 * re-exported here is only what a caller of this feature needs to name.
 */
export type { CourseEditorErrors as CreateCourseErrors } from "@/features/course/Instructor/course-editor/types/course-editor.types";
export type { CourseRequest, InstructorCourseResponse } from "@/shared/courses";
