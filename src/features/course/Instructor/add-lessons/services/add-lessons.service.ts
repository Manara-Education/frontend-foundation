import * as api from "../api/add-lessons.api";
import type { CourseRequest, LessonRequest } from "../types/add-lessons.types";

export const addLessonsService = {
  async getMyCourses() {
    const { data } = await api.getMyCourses();
    return data.data!;
  },

  async updateCourse(courseId: number, payload: CourseRequest) {
    const { data } = await api.updateCourse(courseId, payload);
    return data.data!;
  },

  async getCourseLessons(courseId: number) {
    const { data } = await api.getCourseLessons(courseId);
    return data.data!;
  },

  async addLesson(courseId: number, payload: LessonRequest) {
    const { data } = await api.addLesson(courseId, payload);
    return data.data!;
  },

  async updateLesson(courseId: number, lessonId: number, payload: LessonRequest) {
    const { data } = await api.updateLesson(courseId, lessonId, payload);
    return data.data!;
  },

  async deleteLesson(courseId: number, lessonId: number) {
    await api.deleteLesson(courseId, lessonId);
  },
};
