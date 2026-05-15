import { useState, useEffect, useCallback } from "react";
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

export function useAddLessons({ courseId }: UseAddLessonsArgs) {
  const numCourseId = Number(courseId);

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCourseEdit, setShowCourseEdit] = useState(false);

  const [displayTitle, setDisplayTitle] = useState("");
  const [displayDesc, setDisplayDesc] = useState("");
  const [displayImage, setDisplayImage] = useState("");
  const [displayPrice, setDisplayPrice] = useState(0);

  const fetchMyCourses = useCallback(async () => {
    try {
      const data = await addLessonsService.getMyCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    if (!numCourseId) return;
    try {
      const data = await addLessonsService.getCourseLessons(numCourseId);
      setLessons(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (err) {
      console.error(err);
    }
  }, [numCourseId]);

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
          videoId: data.videoId,
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
          videoId: data.videoId,
          orderIndex: lessons.length,
        });
        setLessons((prev) => [...prev, created].sort((a, b) => a.orderIndex - b.orderIndex));
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [editingId, numCourseId, lessons.length]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await addLessonsService.deleteLesson(numCourseId, id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  }, [editingId, numCourseId]);

  const handleEdit = useCallback((id: number) => {
    setShowForm(false);
    setEditingId(id);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
  }, []);

  const handleSaveCourseEdit = useCallback(async ({ title, description, imageUrl, price }: EditCourseFormData) => {
    try {
      await addLessonsService.updateCourse(numCourseId, {
        title,
        description,
        image: imageUrl,
        price,
      });
      setDisplayTitle(title);
      setDisplayDesc(description);
      setDisplayImage(imageUrl);
      setDisplayPrice(price);
    } catch (err) {
      console.error(err);
    }
  }, [numCourseId]);

  const reorderLessons = useCallback(async (reordered: Lesson[]) => {
    setLessons(reordered);
    try {
      await Promise.all(reordered.map((lesson, index) =>
        addLessonsService.updateLesson(numCourseId, lesson.id, {
          title: lesson.title,
          summary: lesson.summary,
          description: lesson.description,
          videoId: lesson.videoId,
          duration: lesson.duration,
          orderIndex: index,
        }),
      ));
    } catch (err) {
      console.error(err);
      await fetchLessons();
    }
  }, [numCourseId, fetchLessons]);

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
