import { useState } from "react";
import { createCourseService } from "../services/create-course.service";
import type { CreateCourseErrors } from "../types/create-course.types";

interface UseCreateCourseArgs {
  onCancel?: () => void;
}

export function useCreateCourse({ onCancel }: UseCreateCourseArgs) {
  const [createdCourseId, setCreatedCourseId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<CreateCourseErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (): CreateCourseErrors => {
    const e: CreateCourseErrors = {};
    if (!title.trim()) e.title = "يرجى إدخال اسم الدورة";
    else if (title.trim().length < 5) e.title = "اسم الدورة يجب أن يكون 5 أحرف على الأقل";
    if (!description.trim()) e.description = "يرجى إدخال وصف مختصر للدورة";
    else if (description.trim().length < 20) e.description = "الوصف يجب أن يكون 20 حرفاً على الأقل";
    if (price !== "" && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
      e.price = "لا يمكن أن يكون السعر قيمة سالبة";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setError(null);
    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        imageUrl = await createCourseService.uploadFile(imageFile);
      }

      const parsedPrice = price === "" ? 0 : parseFloat(price);
      const newCourse = await createCourseService.createCourse({
        title: title.trim(),
        description: description.trim(),
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        image: imageUrl,
      });
      setCreatedCourseId(newCourse.id.toString());
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      // ApiError sets `message` from the first backend error, so both branches read the same.
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
  };

  const handleImageChange = (f: File | null, p: string | null) => {
    setImageFile(f);
    setImagePreview(p);
  };

  const dismissError = () => setError(null);

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setTitle("");
    setDescription("");
    setPrice("");
    setImageFile(null);
    setImagePreview(null);
    onCancel?.();
  };

  return {
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
    dismissError,
    setShowSuccess,
  };
}
