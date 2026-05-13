import * as api from "../api/lesson-player.api";
import { toCourseForPlayer } from "../mappers/lesson-player.mapper";
import type { CourseForPlayer } from "../types/lesson-player.types";

export const lessonPlayerService = {
  async loadCourseForPlayer(courseId: number): Promise<CourseForPlayer> {
    const { data: courseRes } = await api.getCourseById(courseId);
    const course = courseRes.data!;
    const { data: lessonsRes } = await api.getCourseLessons(courseId);
    const lessons = lessonsRes.data!;
    return toCourseForPlayer(course, lessons);
  },

  async markLessonCompleted(courseId: number, lessonId: number): Promise<void> {
    await api.markLessonCompleted(courseId, lessonId);
  },
};
