import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "@/shared/api";
import { addLessonsService } from "../services/add-lessons.service";
import type {
  Course,
  EditCourseFormData,
  Lesson,
  LessonSavePayload,
} from "../types/add-lessons.types";

interface UseAddLessonsArgs {
  courseId: string;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.errors.join(", ") || err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return "تعذّر إكمال العملية. يرجى المحاولة مرة أخرى.";
}

export function useAddLessons({ courseId }: UseAddLessonsArgs) {
  const numCourseId = Number(courseId);

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCourseEdit, setShowCourseEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastFailedActionRef = useRef<(() => void) | null>(null);

  const [displayTitle, setDisplayTitle] = useState("");
  const [displayDesc, setDisplayDesc] = useState("");
  const [displayImage, setDisplayImage] = useState("");
  const [displayPrice, setDisplayPrice] = useState(0);

  const reportError = useCallback((err: unknown, retry?: () => void) => {
    console.error(err);
    lastFailedActionRef.current = retry ?? null;
    setErrorMessage(extractErrorMessage(err));
  }, []);

  const dismissError = useCallback(() => {
    lastFailedActionRef.current = null;
    setErrorMessage(null);
  }, []);

  const retryError = useCallback(() => {
    const action = lastFailedActionRef.current;
    lastFailedActionRef.current = null;
    setErrorMessage(null);
    action?.();
  }, []);

  const fetchMyCourses = useCallback(async () => {
    try {
      const data = await addLessonsService.getMyCourses();
      setCourses(data);
    } catch (err) {
      reportError(err, () => void fetchMyCourses());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportError]);

  const fetchLessons = useCallback(async () => {
    if (!numCourseId) return;
    try {
      const data = await addLessonsService.getCourseLessons(numCourseId);
      setLessons(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (err) {
      reportError(err, () => void fetchLessons());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numCourseId, reportError]);

  useEffect(() => {
    fetchMyCourses();
    fetchLessons();
  }, [fetchMyCourses, fetchLessons]);

  useEffect(() => {
    if (courses.length > 0) {
      const activeCourse = courses.find((c) => c.id === numCourseId);
      if (activeCourse) {
        setDisplayTitle(activeCourse.title);
        setDisplayDesc(activeCourse.description || "");
        setDisplayImage(activeCourse.image || "");
        setDisplayPrice(activeCourse.price || 0);
      }
      setIsLoading(false);
    }
  }, [courses, numCourseId]);

  const handleSave = useCallback(async (data: LessonSavePayload) => {
    try {
      if (editingId) {
        const updated = await addLessonsService.updateLesson(numCourseId, editingId, {
          title: data.title,
          description: data.description,
          videoUrl: data.videoUrl,
          orderIndex: data.orderIndex,
        });
        setLessons((prev) =>
          prev.map((l) => (l.id === editingId ? updated : l)).sort((a, b) => a.orderIndex - b.orderIndex),
        );
        setEditingId(null);
      } else {
        const created = await addLessonsService.addLesson(numCourseId, {
          title: data.title,
          description: data.description,
          videoUrl: data.videoUrl,
          orderIndex: lessons.length,
        });
        setLessons((prev) => [...prev, created].sort((a, b) => a.orderIndex - b.orderIndex));
        setShowForm(false);
      }
    } catch (err) {
      reportError(err, () => void handleSave(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, numCourseId, lessons.length, reportError]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await addLessonsService.deleteLesson(numCourseId, id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      reportError(err, () => void handleDelete(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, numCourseId, reportError]);

  const handleEdit = useCallback((id: number) => {
    setShowForm(false);
    setEditingId(id);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
  }, []);

  const handleSaveCourseEdit = useCallback(async (data: EditCourseFormData): Promise<boolean> => {
    const { title, description, imageUrl, imageFile, price } = data;
    try {
      const image = imageFile
        ? await addLessonsService.uploadFile(imageFile)
        : imageUrl;
      await addLessonsService.updateCourse(numCourseId, {
        title,
        description,
        image,
        price,
      });
      setDisplayTitle(title);
      setDisplayDesc(description);
      setDisplayImage(image);
      setDisplayPrice(price);
      return true;
    } catch (err) {
      reportError(err, () => void handleSaveCourseEdit(data));
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numCourseId, reportError]);

  const reorderLessons = useCallback(async (reordered: Lesson[]) => {
    setLessons(reordered);
    try {
      await Promise.all(reordered.map((lesson, index) =>
        addLessonsService.updateLesson(numCourseId, lesson.id, {
          title: lesson.title,
          summary: lesson.summary,
          description: lesson.description,
          videoUrl: lesson.videoUrl ?? "",
          duration: lesson.duration,
          orderIndex: index,
        }),
      ));
    } catch (err) {
      reportError(err, () => void reorderLessons(reordered));
      await fetchLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numCourseId, fetchLessons, reportError]);

  const editingLesson: Lesson | null = editingId ? lessons.find((l) => l.id === editingId) ?? null : null;

  return {
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
  };
}
