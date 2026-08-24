import { motion, AnimatePresence } from "motion/react";
import { PageSkeleton } from "./skeleton";
import { HeaderSection } from "./header-section";
import { SearchBar } from "./search-bar";
import { StatusFilterPills } from "./status-filter-pills";
import { CoursesList } from "./courses-list";
import type {
  Course,
  CourseStatusCounts,
  CourseStatusFilter,
} from "../types/all-courses.types";

const FONT = "'Cairo', sans-serif";

interface AllCoursesFormProps {
  isLoading: boolean;
  courses: Course[];
  filtered: Course[];
  query: string;
  statusFilter: CourseStatusFilter;
  statusCounts: CourseStatusCounts;
  isFiltered: boolean;
  onQueryChange: (q: string) => void;
  onStatusFilterChange: (status: CourseStatusFilter) => void;
  onResetFilters: () => void;
  onBack?: () => void;
  onCourseClick?: (courseId: string) => void;
  onCreateCourse?: () => void;
}

export function AllCoursesForm({
  isLoading,
  courses,
  filtered,
  query,
  statusFilter,
  statusCounts,
  isFiltered,
  onQueryChange,
  onStatusFilterChange,
  onResetFilters,
  onBack,
  onCourseClick,
  onCreateCourse,
}: AllCoursesFormProps) {
  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="sk"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PageSkeleton />
          </motion.div>
        )}

        {!isLoading && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HeaderSection totalCount={courses.length} onBack={onBack} />

            <SearchBar query={query} onQueryChange={onQueryChange} />

            <StatusFilterPills
              statusFilter={statusFilter}
              counts={statusCounts}
              onStatusFilterChange={onStatusFilterChange}
            />

            <CoursesList
              courses={courses}
              filtered={filtered}
              isFiltered={isFiltered}
              onResetFilters={onResetFilters}
              onCourseClick={onCourseClick}
              onCreateCourse={onCreateCourse}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
