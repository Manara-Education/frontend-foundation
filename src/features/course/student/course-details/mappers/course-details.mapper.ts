import type {
  CourseDetailData,
  CourseDetailsApiResponse,
  LessonApi,
  LessonResponse,
  LessonStatus,
} from "../types/course-details.types";

function pickCurrentLessonIndex(lessons: LessonApi[]): number {
  const idx = lessons.findIndex((l) => !l.isCompleted);
  return idx === -1 ? lessons.length - 1 : idx;
}

function toLesson(api: LessonApi, status: LessonStatus, number: number): LessonResponse {
  return {
    id: api.id,
    number,
    title: api.title,
    duration: api.duration ?? "",
    status,
  };
}

export function toCourseDetail(dto: CourseDetailsApiResponse): CourseDetailData {
  const { course, instructor, lessons } = dto;

  const ordered = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIdx = pickCurrentLessonIndex(ordered);

  const mappedLessons = ordered.map((l, i) => {
    let status: LessonStatus;
    if (l.isCompleted) status = "completed";
    else if (i === currentIdx) status = "current";
    else status = "not-started";
    return toLesson(l, status, i + 1);
  });

  const completedLessons = mappedLessons.filter((l) => l.status === "completed").length;
  const totalLessons = course.lessonCount ?? mappedLessons.length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const currentLessonApi = ordered[currentIdx];

  return {
    id: course.id,
    title: course.title,
    instructor: instructor.fullName,
    instructorTitle: instructor.specialization ?? "",
    instructorBio: instructor.bio ?? "",
    instructorStudents: 0,
    instructorCourses: 0,
    instructorImage: "",
    description: course.description ?? "",
    outcomes: [],
    skills: [],
    image: course.image ?? "",
    progress,
    totalLessons,
    completedLessons,
    totalDuration: course.duration ?? "",
    remainingDuration: course.remainingDuration ?? "",
    students: course.studentsCount ?? 0,
    rating: 0,
    category: course.subtitle ?? "",
    currentLesson: {
      number: currentLessonApi ? currentIdx + 1 : 0,
      title: currentLessonApi?.title ?? "",
      remaining: course.remainingDuration ?? "",
    },
    lessons: mappedLessons,
  };
}
