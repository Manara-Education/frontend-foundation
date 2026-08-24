import { unwrap } from "@/shared/api";
import {
  mapCourseEditorStateToCourseRequest,
  mapInstructorCourseResponseToEditorState,
  type CourseEditorState,
} from "@/shared/courses";
import * as api from "../api/course-editor.api";

/**
 * Orchestrates the aggregate course endpoints for the editor.
 *
 * Every save is a single request carrying the whole course tree: the state → request
 * translation is the canonical `mapCourseEditorStateToCourseRequest`, and hydration
 * goes back through `mapInstructorCourseResponseToEditorState`. Nothing in this file
 * reshapes a DTO by hand.
 */
export const courseEditorService = {
  /** `GET` the aggregate and hand back editor state, ready to render. */
  async loadCourse(courseId: number): Promise<CourseEditorState> {
    const response = await api.getInstructorCourseRequest(courseId);
    return mapInstructorCourseResponseToEditorState(unwrap(response));
  },

  /** `POST` the aggregate. Returns the saved course as editor state, ids included. */
  async createCourse(state: CourseEditorState): Promise<CourseEditorState> {
    const response = await api.createCourseRequest(mapCourseEditorStateToCourseRequest(state));
    return mapInstructorCourseResponseToEditorState(unwrap(response));
  },

  /** `PUT` the aggregate. The response is the source of truth for newly assigned ids. */
  async updateCourse(courseId: number, state: CourseEditorState): Promise<CourseEditorState> {
    const response = await api.updateCourseRequest(
      courseId,
      mapCourseEditorStateToCourseRequest(state),
    );
    return mapInstructorCourseResponseToEditorState(unwrap(response));
  },

  async uploadCourseImage(file: File): Promise<string> {
    return unwrap(await api.uploadFileRequest(file)).url;
  },
};
