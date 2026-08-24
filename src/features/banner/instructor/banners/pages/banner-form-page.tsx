import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import { BannerForm } from "../components/banner-form";
import { FONT, PRIMARY } from "../formatters/banners.formatter";
import { useBannerForm } from "../hooks/use-banner-form";
import { bannersService } from "../services/banners.service";
import type { InstructorBanner } from "../types/banners.types";

interface BannerFormPageProps {
  /** Omitted when creating. Given when editing — the banner is read by id. */
  bannerId?: number;
  onSaved: () => void;
  onCancel: () => void;
}

/**
 * The banner editor.
 *
 * An edited banner is fetched by the id in the URL rather than handed over by the list it
 * was clicked in. That is what makes the editor's address real: it opens the same banner
 * on a refresh, in a second tab, or from a link, with no earlier visit to the list needed.
 */
export function BannerFormPage({ bannerId, onSaved, onCancel }: BannerFormPageProps) {
  const [banner, setBanner] = useState<InstructorBanner | null>(null);
  const [isLoading, setIsLoading] = useState(bannerId !== undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (bannerId === undefined) {
      setBanner(null);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    bannersService
      .loadBanner(bannerId)
      .then((loaded) => {
        if (!cancelled) setBanner(loaded);
      })
      .catch((err) => {
        console.error("Failed to load banner", err);
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError ? (err.errors[0] ?? "تعذر تحميل الإعلان") : "تعذر تحميل الإعلان",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bannerId]);

  if (isLoading) {
    return (
      <div dir="rtl" className="flex flex-col gap-4" style={{ fontFamily: FONT }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 140,
              borderRadius: 18,
              background: "linear-gradient(90deg, #F2F3F9 0%, #E8EAF2 50%, #F2F3F9 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div dir="rtl" style={{ fontFamily: FONT, textAlign: "center", padding: 40 }}>
        <p style={{ fontSize: 14, color: "#9BA3C4", marginBottom: 16 }}>{loadError}</p>
        <button
          onClick={onCancel}
          style={{
            height: 40,
            paddingLeft: 18,
            paddingRight: 18,
            borderRadius: 12,
            background: "rgba(78,91,146,0.06)",
            color: PRIMARY,
            border: "1px solid rgba(78,91,146,0.14)",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          العودة إلى الإعلانات
        </button>
      </div>
    );
  }

  /*
    Keyed on the banner being edited so the form's initial state is taken again when the
    route moves from one banner to another, or from an edit to a create.
  */
  return <BannerFormFields key={banner?.id ?? "new"} editingBanner={banner} onSaved={onSaved} onCancel={onCancel} />;
}

function BannerFormFields({
  editingBanner,
  onSaved,
  onCancel,
}: {
  editingBanner: InstructorBanner | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
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
