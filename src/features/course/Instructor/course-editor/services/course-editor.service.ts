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

  /**
   * `POST` the aggregate. Returns the saved course as editor state, ids included.
   *
   * The only call that sends `status`: creating a course is where the wizard's "publish"
   * and "save as draft" actually differ.
   */
  async createCourse(state: CourseEditorState): Promise<CourseEditorState> {
    const response = await api.createCourseRequest(
      mapCourseEditorStateToCourseRequest(state, { includeStatus: true }),
    );
    return mapInstructorCourseResponseToEditorState(unwrap(response));
  },

  /**
   * `PUT` the aggregate. The response is the source of truth for newly assigned ids.
   *
   * The payload carries no `status`: an edit is an edit, and publication is changed
   * through the two lifecycle calls below.
   */
  async updateCourse(courseId: number, state: CourseEditorState): Promise<CourseEditorState> {
    const response = await api.updateCourseRequest(
      courseId,
      mapCourseEditorStateToCourseRequest(state),
    );
    return mapInstructorCourseResponseToEditorState(unwrap(response));
  },

  /** Publish. Also the way an instructor settles a new version, clearing "Updated". */
  async publishCourse(courseId: number): Promise<CourseEditorState> {
    return mapInstructorCourseResponseToEditorState(unwrap(await api.publishCourseRequest(courseId)));
  },

  async unpublishCourse(courseId: number): Promise<CourseEditorState> {
    return mapInstructorCourseResponseToEditorState(
      unwrap(await api.unpublishCourseRequest(courseId)),
    );
  },

  /**
   * Persist a module order, and nothing else.
   *
   * Sends only the ordered ids, so a drag cannot overwrite a title someone changed in
   * another tab, and so the server rejects an order built from a module list that has
   * since changed rather than half-applying it.
   */
  async reorderModules(
    courseId: number,
    moduleIds: number[],
    signal?: AbortSignal,
  ): Promise<CourseEditorState> {
    const response = await api.reorderCourseModulesRequest(courseId, { moduleIds }, signal);
    return mapInstructorCourseResponseToEditorState(unwrap(response));
  },

  async uploadCourseImage(file: File): Promise<string> {
    return unwrap(await api.uploadFileRequest(file)).url;
  },
};
