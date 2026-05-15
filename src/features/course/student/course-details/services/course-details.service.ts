import { instructorService } from "@/features/instructor/services/instructor.service";
import type { InstructorPublicResponse } from "@/features/instructor/types/instructor.types";
import * as api from "../api/course-details.api";
import { toCourseDetail } from "../mappers/course-details.mapper";
import type { CourseDetailData } from "../types/course-details.types";

export const courseDetailsService = {
  async loadCourseDetail(courseId: number): Promise<CourseDetailData> {
    const { data: courseRes } = await api.getCourseById(courseId);
    const course = courseRes.data!;
    const { data: lessonsRes } = await api.getCourseLessons(courseId);
    const lessons = lessonsRes.data!;

    let instructorInfo: Partial<InstructorPublicResponse> = {
      fullName: course.instructorName || "المدرّب",
      bio: "",
      specialization: "",
    };

    if (course.instructorId) {
      try {
        instructorInfo = await instructorService.getInstructorProfile(course.instructorId);
      } catch {
        // fall back to defaults
      }
    }

    return toCourseDetail(course, lessons, instructorInfo);
  },
};
