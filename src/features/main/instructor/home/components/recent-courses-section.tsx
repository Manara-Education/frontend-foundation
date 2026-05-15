import { ChevronLeft } from "lucide-react";
import { CourseCard } from "./course-card";
import { EmptyCourses } from "./empty-courses";
import type { Course } from "../types/home.types";
import { PRIMARY, FONT, TEXT_DARK } from "./theme";

interface RecentCoursesSectionProps {
  courses: Course[];
  hasCourses: boolean;
  onCreateCourse?: () => void;
  onCourseClick?: (courseId: string) => void;
  onViewAllCourses?: () => void;
}

export function RecentCoursesSection({
  courses,
  hasCourses,
  onCreateCourse,
  onCourseClick,
  onViewAllCourses,
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

        {hasCourses && (
          <button
            className="flex items-center gap-1 transition-colors duration-150"
            style={{
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 600,
              color: PRIMARY,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onClick={onViewAllCourses}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            عرض الكل
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {hasCourses ? (
        <div className="flex flex-col gap-3">
          {courses.map((course, i) => (
            <CourseCard
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
