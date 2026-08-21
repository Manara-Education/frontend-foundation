import { CourseEditorTabs } from "../components/course-editor-tabs";
import { PageSkeleton } from "../components/page-skeleton";
import { useAddLessons } from "../hooks/use-add-lessons";

const FONT = "'Cairo', sans-serif";

interface AddLessonsPageProps {
  courseId: string;
  onFinish: () => void;
}

export function AddLessonsPage({ courseId, onFinish }: AddLessonsPageProps) {
  const controller = useAddLessons({ courseId });

  if (controller.editor.isLoading) {
    return (
      <div dir="rtl" style={{ fontFamily: FONT }}>
        <PageSkeleton />
      </div>
    );
  }

  return <CourseEditorTabs {...controller} onFinish={onFinish} />;
}
