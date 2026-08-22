import { InstructorCourseCard } from "@/features/course/components/instructor-course-card";
import { EmptyCourses } from "./empty-courses";
import type { Course } from "../types/home.types";
import { FONT, TEXT_DARK } from "./theme";

interface RecentCoursesSectionProps {
  courses: Course[];
  hasCourses: boolean;
  onCreateCourse?: () => void;
  onCourseClick?: (courseId: string) => void;
}

/**
 * The home page's course preview. It renders the same `InstructorCourseCard` as "دوراتي",
 * so a course reads the same on both screens; the full list lives behind the sidebar's
 * "دوراتي" entry rather than behind a "عرض الكل" shortcut here.
 */
export function RecentCoursesSection({
  courses,
  hasCourses,
  onCreateCourse,
  onCourseClick,
}: RecentCoursesSectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 19,
            color: TEXT_DARK,
          }}
        >
          دوراتي الأخيرة
        </h2>
      </div>

      {hasCourses ? (
        <div className="flex flex-col gap-3">
          {courses.map((course, i) => (
            <InstructorCourseCard
              key={course.id}
              course={course}
              delay={0.1 + i * 0.06}
              onNavigate={() => onCourseClick?.(course.id.toString())}
            />
          ))}
        </div>
      ) : (
        <EmptyCourses onCreateCourse={onCreateCourse} />
      )}
    </section>
  );
}
