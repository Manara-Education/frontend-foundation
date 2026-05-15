import { AnimatePresence, motion } from "motion/react";
import { FONT } from "../formatters/courses.formatter";
import type { CourseView, FilterKey } from "../types/courses.types";
import { CoursesGrid } from "./courses-grid";
import { CoursesHeader } from "./courses-header";
import { CoursesSearchFilters } from "./courses-search-filters";
import { CoursesSkeleton } from "./courses-skeleton";

interface CoursesFormProps {
  isLoading: boolean;
  query: string;
  activeFilter: FilterKey;
  filtered: CourseView[];
  total: number;
  completed: number;
  inProgress: number;
  onQueryChange: (value: string) => void;
  onFilterChange: (key: FilterKey) => void;
  onCourseClick?: (id: number) => void;
}

export function CoursesForm({
  isLoading,
  query,
  activeFilter,
  filtered,
  total,
  completed,
  inProgress,
  onQueryChange,
  onFilterChange,
  onCourseClick,
}: CoursesFormProps) {
  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CoursesSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CoursesHeader total={total} completed={completed} inProgress={inProgress} />

            <CoursesSearchFilters
              query={query}
              activeFilter={activeFilter}
              filteredCount={filtered.length}
              onQueryChange={onQueryChange}
              onFilterChange={onFilterChange}
            />

            <CoursesGrid
              filtered={filtered}
              query={query}
              activeFilter={activeFilter}
              onCourseClick={onCourseClick}
            />

            <div style={{ height: 24 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
