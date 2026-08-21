import { CourseEditorWizard } from "../components/course-editor-wizard";
import { useCreateCourse } from "../hooks/use-create-course";

interface CreateCoursePageProps {
  onCancel?: () => void;
}

export function CreateCoursePage({ onCancel }: CreateCoursePageProps) {
  const controller = useCreateCourse({ onCancel });
  return <CourseEditorWizard {...controller} />;
}
