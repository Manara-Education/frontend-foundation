import { CourseEditorTabs } from "../components/course-editor-tabs";
import { PageSkeleton } from "../components/page-skeleton";
import { useAddLessons, type CourseTab } from "../hooks/use-add-lessons";

const FONT = "'Cairo', sans-serif";

interface AddLessonsPageProps {
  courseId: string;
  /** The open tab, and how to open another — both owned by the route. */
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
  onFinish: () => void;
}

export function AddLessonsPage({ courseId, activeTab, onTabChange, onFinish }: AddLessonsPageProps) {
  const controller = useAddLessons({ courseId, activeTab, onTabChange });

  if (controller.editor.isLoading) {
    return (
      <div dir="rtl" style={{ fontFamily: FONT }}>
        <PageSkeleton />
      </div>
    );
  }

  return <CourseEditorTabs {...controller} onFinish={onFinish} />;
}
