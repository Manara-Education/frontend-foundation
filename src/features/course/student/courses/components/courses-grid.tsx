import { AnimatePresence, motion } from "motion/react";
import type { CourseView, FilterKey } from "../types/courses.types";
import { CourseCard } from "./course-card";
import { EmptyState } from "./empty-state";

interface CoursesGridProps {
  filtered: CourseView[];
  query: string;
  activeFilter: FilterKey;
  onCourseClick?: (id: number) => void;
  onBrowse?: () => void;
}

export function CoursesGrid({ filtered, query, activeFilter, onCourseClick, onBrowse }: CoursesGridProps) {
  return (
    <AnimatePresence mode="wait">
      {filtered.length === 0 ? (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <EmptyState query={query} filter={activeFilter} onBrowse={onBrowse} />
        </motion.div>
      ) : (
        <motion.div
          key={`${activeFilter}-${query}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} onCourseClick={onCourseClick} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
