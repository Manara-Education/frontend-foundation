import { CreateCourseForm } from "../components/create-course-form";
import { useCreateCourse } from "../hooks/use-create-course";

interface CreateCoursePageProps {
  onCancel?: () => void;
  onCourseCreated?: (courseId: string) => void;
}

export function CreateCoursePage({ onCancel, onCourseCreated }: CreateCoursePageProps) {
  const {
    title,
    description,
    price,
    imageFile,
    imagePreview,
    errors,
    error,
    isSubmitting,
    showSuccess,
    createdCourseId,
    handleTitleChange,
    handleDescriptionChange,
    handlePriceChange,
    handleImageChange,
    handleSubmit,
    handleSuccessClose,
    setShowSuccess,
  } = useCreateCourse({ onCancel });

  return (
    <CreateCourseForm
      title={title}
      description={description}
      price={price}
      imageFile={imageFile}
      imagePreview={imagePreview}
      errors={errors}
      error={error}
      isSubmitting={isSubmitting}
      showSuccess={showSuccess}
      onTitleChange={handleTitleChange}
      onDescriptionChange={handleDescriptionChange}
      onPriceChange={handlePriceChange}
      onImageChange={handleImageChange}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      onSuccessClose={handleSuccessClose}
      onAddLessons={() => {
        const savedId = createdCourseId;
        setShowSuccess(false);
        onCourseCreated?.(savedId);
      }}
    />
  );
}
