import { AnimatePresence } from "motion/react";
import { AddLessonsForm } from "../components/add-lessons-form";
import { ErrorOverlay } from "@/shared/components/ErrorOverlay/ErrorOverlay";
import { PageSkeleton } from "../components/page-skeleton";
import { useAddLessons } from "../hooks/use-add-lessons";

const FONT = "'Cairo', sans-serif";

interface AddLessonsPageProps {
  courseId: string;
  onFinish: () => void;
}

export function AddLessonsPage({ courseId, onFinish }: AddLessonsPageProps) {
  const {
    lessons,
    isLoading,
    showForm,
    editingId,
    editingLesson,
    showCourseEdit,
    displayTitle,
    displayDesc,
    displayImage,
    displayPrice,
    errorMessage,
    dismissError,
    retryError,
    setShowForm,
    setShowCourseEdit,
    handleSave,
    handleDelete,
    handleEdit,
    handleCancelForm,
    handleSaveCourseEdit,
    reorderLessons,
  } = useAddLessons({ courseId });

  if (isLoading) {
    return (
      <div dir="rtl" style={{ fontFamily: FONT }}>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <>
      <AddLessonsForm
        lessons={lessons}
        showForm={showForm}
        editingId={editingId}
        editingLesson={editingLesson}
        showCourseEdit={showCourseEdit}
        displayTitle={displayTitle}
        displayDesc={displayDesc}
        displayImage={displayImage}
        displayPrice={displayPrice}
        onShowForm={() => setShowForm(true)}
        onShowCourseEdit={() => setShowCourseEdit(true)}
        onCloseCourseEdit={() => setShowCourseEdit(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onCancelForm={handleCancelForm}
        onSaveCourseEdit={handleSaveCourseEdit}
        onReorder={reorderLessons}
        onFinish={onFinish}
      />
      <AnimatePresence>
        {errorMessage !== null && (
          <ErrorOverlay
            message={errorMessage}
            onRetry={retryError}
            onClose={dismissError}
          />
        )}
      </AnimatePresence>
    </>
  );
}
