import * as api from "../api/add-lessons.api";
import { getMyCourses } from "@/shared/courses";
import type { CourseRequest, LessonRequest } from "../types/add-lessons.types";

export const addLessonsService = {
  getMyCourses,

  async updateCourse(courseId: number, payload: CourseRequest) {
    const { data } = await api.updateCourse(courseId, payload);
    return data.data!;
  },

  async uploadFile(file: File) {
    const { data } = await api.uploadFile(file);
    return data.data!.url;
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
