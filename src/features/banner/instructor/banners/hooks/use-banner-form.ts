import { useCallback, useState } from "react";
import { ApiError } from "@/shared/api";
import {
  addDays,
  formatDateInput,
  getSavedMessage,
} from "../formatters/banners.formatter";
import { createEmptyBannerForm, toBannerForm } from "../mappers/banners.mapper";
import { bannersService } from "../services/banners.service";
import type {
  BannerFormErrors,
  BannerFormState,
  BannerSaveAction,
  InstructorBanner,
} from "../types/banners.types";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** The pause the reference holds the success confirmation for before it leaves the editor. */
const SAVED_MESSAGE_MS = 900;

interface UseBannerFormOptions {
  editingBanner?: InstructorBanner | null;
  onSaved: () => void;
}

/**
 * The banner editor: its state, its rules, and the three ways out of it.
 *
 * The validation here is the same set the backend enforces. Running it first is not
 * redundancy — it is what tells the owner which field is wrong while they are still on it,
 * instead of turning the whole save into one message at the bottom.
 */
export function useBannerForm({ editingBanner, onSaved }: UseBannerFormOptions) {
  const [form, setForm] = useState<BannerFormState>(() =>
    editingBanner ? toBannerForm(editingBanner) : createEmptyBannerForm(),
  );
  const [errors, setErrors] = useState<BannerFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const update = useCallback((patch: Partial<BannerFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const clearError = useCallback((field: keyof BannerFormErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  /** The shortcut row: an end date this many days after the start already chosen. */
  const applyDuration = useCallback(
    (days: number) => {
      const start = form.startDate ? new Date(form.startDate) : new Date();
      update({ endDate: formatDateInput(addDays(start, days)), endTime: "23:59" });
      clearError("endDate");
    },
    [form.startDate, update, clearError],
  );

  /**
   * The picked file goes to the shared upload endpoint and the banner keeps the URL it
   * answers with.
   *
   * The reference read the file into a base64 data URL, which is a prototype standing in for
   * having nowhere to put it. This project has somewhere: the same `/v1/uploads` a course
   * cover goes to. The control, its wording and both size and type messages are unchanged.
   */
  const handleImageFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setErrors((current) => ({
          ...current,
          imageUrl: "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WebP.",
        }));
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setErrors((current) => ({ ...current, imageUrl: "حجم الملف يتجاوز ٥ ميجابايت." }));
        return;
      }
      setUploading(true);
      setErrors((current) => ({ ...current, imageUrl: undefined }));
      try {
        update({ imageUrl: await bannersService.uploadBannerImage(file) });
      } catch (err) {
        console.error("Failed to upload banner image", err);
        setErrors((current) => ({
          ...current,
          imageUrl: toMessage(err, "تعذر رفع الصورة، حاول مرة أخرى"),
        }));
      } finally {
        setUploading(false);
      }
    },
    [update],
  );

  const handleSave = useCallback(
    async (action: BannerSaveAction) => {
      const validationErrors = validateBannerForm(form, action === "draft");
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setSaving(true);
      try {
        if (editingBanner) {
          await bannersService.updateBanner(editingBanner, form, action);
        } else {
          await bannersService.createBanner(form, action);
        }
        setSavedMessage(getSavedMessage(action));
        window.setTimeout(onSaved, SAVED_MESSAGE_MS);
      } catch (err) {
        console.error("Failed to save banner", err);
        setErrors({ general: toMessage(err, "تعذر حفظ الإعلان، حاول مرة أخرى") });
      } finally {
        setSaving(false);
      }
    },
    [form, editingBanner, onSaved],
  );

  return {
    form,
    errors,
    saving,
    uploading,
    savedMessage,
    isEditing: !!editingBanner,
    onFieldChange: update,
    onClearError: clearError,
    onApplyDuration: applyDuration,
    onImageFile: handleImageFile,
    onRemoveImage: () => update({ imageUrl: "" }),
    onSave: handleSave,
  };
}

/**
 * The rules, in the wording the reference gives them.
 *
 * A draft is held to fewer of them on purpose: an unfinished banner is allowed to be
 * half-scheduled, which is most of what a draft is for.
 */
export function validateBannerForm(form: BannerFormState, isDraft: boolean): BannerFormErrors {
  const errors: BannerFormErrors = {};

  if (!form.internalName.trim()) errors.internalName = "أدخل اسماً داخلياً للإعلان.";
  if (!form.title.trim()) errors.title = "أدخل عنوان الإعلان للطلاب.";

  if (form.callToActionLabel && !form.callToActionUrl.trim()) {
    errors.callToActionUrl = "أدخل رابط زر الإجراء.";
  }
  if (form.callToActionUrl && !/^https?:\/\/|^#|^\//.test(form.callToActionUrl)) {
    errors.callToActionUrl = "أدخل رابطاً صحيحاً (يبدأ بـ http أو https).";
  }

  if (!isDraft) {
    if (!form.endDate) {
      errors.endDate = "حدد تاريخ انتهاء الإعلان.";
    } else if (
      form.startDate &&
      form.startDate >= form.endDate &&
      !(form.startDate === form.endDate && form.startTime < form.endTime)
    ) {
      errors.endDate = "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء.";
    }
  }

  if (form.priority < 1 || form.priority > 10) errors.priority = "يجب أن تكون الأولوية بين ١ و١٠.";

  return errors;
}

function toMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? (err.errors[0] ?? fallback) : fallback;
}

export type UseBannerFormReturn = ReturnType<typeof useBannerForm>;
