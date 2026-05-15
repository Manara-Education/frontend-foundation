import { motion, AnimatePresence } from "motion/react";
import { CourseCard } from "./course-card";
import { EmptyState } from "./empty-state";
import type { Course } from "../types/all-courses.types";

const FONT = "'Cairo', sans-serif";
const TEXT_MUTE = "#A8ADCA";

interface CoursesListProps {
  courses: Course[];
  filtered: Course[];
  isFiltered: boolean;
  onResetQuery: () => void;
  onCourseClick?: (courseId: string) => void;
  onCreateCourse?: () => void;
}

export function CoursesList({
  courses,
  filtered,
  isFiltered,
  onResetQuery,
  onCourseClick,
  onCreateCourse,
}: CoursesListProps) {
  return (
    <section>
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <EmptyState
              isFiltered={isFiltered}
              onReset={onResetQuery}
              onCreateCourse={onCreateCourse}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 12.5,
                color: TEXT_MUTE,
                marginBottom: 4,
              }}
            >
              {filtered.length === courses.length
                ? `عرض جميع الدورات (${courses.length})`
                : `${filtered.length} نتيجة من أصل ${courses.length}`}
            </div>

            {filtered.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                delay={i * 0.05}
                onNavigate={() => onCourseClick?.(course.id.toString())}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
