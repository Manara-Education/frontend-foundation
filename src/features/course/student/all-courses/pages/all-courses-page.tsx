import { AllCoursesForm } from "../components/all-courses-form";
import { useAllCourses } from "../hooks/use-all-courses";

interface AllCoursesPageProps {
  onBack?: () => void;
  onCourseClick?: (courseId: string) => void;
  onCreateCourse?: () => void;
}

export function AllCoursesPage({ onBack, onCourseClick, onCreateCourse }: AllCoursesPageProps) {
  const {
    courses,
    filtered,
    isLoading,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    statusCounts,
    isFiltered,
    resetFilters,
  } = useAllCourses();

  return (
    <AllCoursesForm
      isLoading={isLoading}
      courses={courses}
      filtered={filtered}
      query={query}
      statusFilter={statusFilter}
      statusCounts={statusCounts}
      isFiltered={isFiltered}
      onQueryChange={setQuery}
      onStatusFilterChange={setStatusFilter}
      onResetFilters={resetFilters}
      onBack={onBack}
      onCourseClick={onCourseClick}
      onCreateCourse={onCreateCourse}
    />
  );
}
