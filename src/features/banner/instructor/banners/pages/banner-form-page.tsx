import { BannerForm } from "../components/banner-form";
import { useBannerForm } from "../hooks/use-banner-form";
import type { InstructorBanner } from "../types/banners.types";

interface BannerFormPageProps {
  editingBanner?: InstructorBanner | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function BannerFormPage({ editingBanner, onSaved, onCancel }: BannerFormPageProps) {
  const view = useBannerForm({ editingBanner, onSaved });

  return (
    <BannerForm
      form={view.form}
      errors={view.errors}
      saving={view.saving}
      uploading={view.uploading}
      savedMessage={view.savedMessage}
      isEditing={view.isEditing}
      onFieldChange={view.onFieldChange}
      onClearError={view.onClearError}
      onApplyDuration={view.onApplyDuration}
      onImageFile={view.onImageFile}
      onRemoveImage={view.onRemoveImage}
      onSave={view.onSave}
      onCancel={onCancel}
    />
  );
}
