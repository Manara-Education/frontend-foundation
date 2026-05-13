import type { InstructorPublicResponse } from "@/features/instructor/types/instructor.types";
import { formatMinutesLabel, toLessonStatus } from "../formatters/course-details.formatter";
import type { Course, CourseDetailData, Lesson, LessonView } from "../types/course-details.types";

export function toCourseDetail(
  course: Course,
  lessons: Lesson[],
  instructor: Partial<InstructorPublicResponse>,
): CourseDetailData {
  const mappedLessons: LessonView[] = lessons.map((l) => ({
    id: l.id,
    number: l.orderIndex,
    title: l.title,
    duration: formatMinutesLabel(l.duration),
    status: toLessonStatus(l.isCompleted),
  }));

  return {
    id: course.id,
    title: course.title,
    description: course.description || "",
    image: course.image || "",
    instructor: instructor.fullName || "",
    instructorTitle: instructor.specialization || "أستاذ متخصص في المجال",
    instructorBio: instructor.bio || "",
    instructorStudents: 0,
    instructorCourses: 0,
    instructorImage: "",
    outcomes: [],
    skills: [],
    progress: 0,
    totalLessons: lessons.length,
    completedLessons: lessons.filter((l) => l.isCompleted).length,
    totalDuration: formatMinutesLabel(course.duration),
    students: course.studentsCount || 0,
    rating: 0,
    category: "عام",
    lessons: mappedLessons,
  };
}
