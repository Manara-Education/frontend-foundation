import { useExploreCourses } from "../hooks/use-explore-courses";
import { ExploreForm } from "../components/explore-form";
import { ExploreSkeleton } from "../components/explore-skeleton";

interface ExplorePageProps {
  onCourseClick?: (id: number) => void;
  /** The shell's own "back to home" navigation, behind the breadcrumb's first crumb. */
  onGoHome?: () => void;
  enrolledCourseIds?: Set<number>;
}

export function ExplorePage({ onCourseClick, onGoHome, enrolledCourseIds }: ExplorePageProps) {
  const explore = useExploreCourses();

  if (explore.isLoading) {
    return <ExploreSkeleton />;
  }

  const nonEnrolledFiltered = explore.filtered.filter(
    (c) => !enrolledCourseIds?.has(c.id)
  );

  const nonEnrolledCourses = explore.courses.filter(
    (c) => !enrolledCourseIds?.has(c.id)
  );

  return (
    <ExploreForm
      courses={nonEnrolledCourses}
      filtered={nonEnrolledFiltered}
      query={explore.query}
      isFiltered={explore.isFiltered}
      onQueryChange={explore.setQuery}
      onResetQuery={explore.resetQuery}
      onCourseClick={onCourseClick}
      onGoHome={onGoHome}
      enrolledCourseIds={enrolledCourseIds}
    />
  );
}
