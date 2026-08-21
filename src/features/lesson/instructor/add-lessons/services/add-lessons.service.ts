import { unwrap, unwrapList } from "@/shared/api";
import { getMyCourses } from "@/shared/courses";
import type { CourseRequest, LessonRequest } from "@/shared/courses";
import * as api from "../api/add-lessons.api";

export const addLessonsService = {
  getMyCourses,

  async updateCourse(courseId: number, payload: CourseRequest) {
    return unwrap(await api.updateCourse(courseId, payload));
  },

  async uploadFile(file: File) {
    return unwrap(await api.uploadFile(file)).url;
  },

  async getCourseLessons(courseId: number) {
    return unwrapList(await api.getCourseLessons(courseId));
  },

  async addLesson(courseId: number, payload: LessonRequest) {
    return unwrap(await api.addLesson(courseId, payload));
  },

  async updateLesson(courseId: number, lessonId: number, payload: LessonRequest) {
    return unwrap(await api.updateLesson(courseId, lessonId, payload));
  },

  async deleteLesson(courseId: number, lessonId: number) {
    await api.deleteLesson(courseId, lessonId);
  },
};
