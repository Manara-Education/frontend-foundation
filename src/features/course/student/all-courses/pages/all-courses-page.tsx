import { AllCoursesForm } from "../components/all-courses-form";
import { useAllCourses } from "../hooks/use-all-courses";

interface AllCoursesPageProps {
  onBack?: () => void;
  onCourseClick?: (courseId: string) => void;
  onCreateCourse?: () => void;
}

export function AllCoursesPage({ onBack, onCourseClick, onCreateCourse }: AllCoursesPageProps) {
  const { courses, filtered, isLoading, query, setQuery, isFiltered, resetQuery } =
    useAllCourses();

  return (
    <AllCoursesForm
      isLoading={isLoading}
      courses={courses}
      filtered={filtered}
      query={query}
      isFiltered={isFiltered}
      onQueryChange={setQuery}
      onResetQuery={resetQuery}
      onBack={onBack}
      onCourseClick={onCourseClick}
      onCreateCourse={onCreateCourse}
    />
  );
}
