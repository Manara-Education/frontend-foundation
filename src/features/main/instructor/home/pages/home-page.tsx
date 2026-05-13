import { HomeForm } from "../components/home-form";
import { useHome } from "../hooks/use-home";

interface InstructorHomePageProps {
  onCreateCourse?: () => void;
  onCourseClick?: (courseId: string) => void;
  onViewAllCourses?: () => void;
}

export function InstructorHomePage({
  onCreateCourse,
  onCourseClick,
  onViewAllCourses,
}: InstructorHomePageProps) {
  const { courses, isLoading, hasCourses, totalEnrolled, firstName } = useHome();

  return (
    <HomeForm
      isLoading={isLoading}
      courses={courses}
      hasCourses={hasCourses}
      totalEnrolled={totalEnrolled}
      firstName={firstName}
      onCreateCourse={onCreateCourse}
      onCourseClick={onCourseClick}
      onViewAllCourses={onViewAllCourses}
    />
  );
}
