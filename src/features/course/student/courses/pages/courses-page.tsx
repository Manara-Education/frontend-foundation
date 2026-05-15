import { useCoursesView } from "../hooks/use-courses-view";
import { CoursesForm } from "../components/courses-form";

interface CoursesPageProps {
  onCourseClick?: (id: number) => void;
}

export function CoursesPage({ onCourseClick }: CoursesPageProps) {
  const view = useCoursesView({ onCourseClick });

  return (
    <CoursesForm
      isLoading={view.isLoading}
      query={view.query}
      activeFilter={view.activeFilter}
      filtered={view.filtered}
      total={view.total}
      completed={view.completed}
      inProgress={view.inProgress}
      onQueryChange={view.onQueryChange}
      onFilterChange={view.onFilterChange}
      onCourseClick={view.onCourseClick}
    />
  );
}
