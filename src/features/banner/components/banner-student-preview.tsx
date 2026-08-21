import { ExternalLink } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import type { BannerPreview } from "../types/banner.types";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

interface BannerStudentPreviewProps {
  banner: BannerPreview;
  /**
   * Kept because every caller supplies it and the dismissal path behind it is wired end to
   * end — but nothing here renders a close control, because the reference banner does not
   * have one. See the note on `use-student-banners`.
   */
  onDismiss?: () => void;
  compact?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/**
 * The banner itself, exactly as a learner sees it.
 *
 * One component for both sides on purpose: the management screen's live preview and the
 * learner's carousel render the same element, so an instructor is looking at the thing that
 * will ship rather than an approximation of it. `compact` is the only difference between
 * them, and it changes nothing but size.
 */
export function BannerStudentPreview({
  banner,
  compact = false,
  onSwipeLeft,
  onSwipeRight,
}: BannerStudentPreviewProps) {
  const hasImage = !!banner.imageUrl;
  const hasCta = !!(banner.callToActionLabel && banner.callToActionUrl);

  return (
    <div
      dir="rtl"
      style={{
        borderRadius: compact ? 16 : 20,
        overflow: "hidden",
        position: "relative",
        fontFamily: FONT,
        boxShadow: compact ? "0 2px 12px rgba(78,91,146,0.12)" : "0 4px 24px rgba(78,91,146,0.14)",
        border: "1px solid rgba(78,91,146,0.1)",
        background: "#1E2340",
        minHeight: compact ? 120 : 160,
      }}
    >
      {/* Background image */}
      {hasImage && (
        <div style={{ position: "absolute", inset: 0 }}>
          <ImageWithFallback
            src={banner.imageUrl!}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hasImage
            ? "linear-gradient(90deg, rgba(14,18,42,0.92) 0%, rgba(14,18,42,0.6) 60%, rgba(14,18,42,0.3) 100%)"
            : `linear-gradient(135deg, ${PRIMARY} 0%, #364178 100%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          padding: compact ? "22px 24px" : "32px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          minHeight: compact ? 150 : 200,
          touchAction: "pan-y",
          cursor: onSwipeLeft || onSwipeRight ? "grab" : "default",
        }}
        onTouchStart={(e) => {
          e.currentTarget.dataset.swipeX = String(e.touches[0].clientX);
        }}
        onTouchEnd={(e) => {
          const startX = parseFloat(e.currentTarget.dataset.swipeX ?? "");
          delete e.currentTarget.dataset.swipeX;
          if (isNaN(startX)) return;
          const delta = startX - e.changedTouches[0].clientX;
          if (Math.abs(delta) < 40) return;
          if (delta > 0) onSwipeLeft?.();
          else onSwipeRight?.();
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: compact ? 15 : 18,
              color: "#fff",
              lineHeight: 1.4,
              marginBottom: banner.description ? 6 : 0,
            }}
          >
            {banner.title || "عنوان الإعلان"}
          </div>
          {banner.description && (
            <div
              style={{
                fontFamily: FONT,
                fontSize: compact ? 12 : 13.5,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.65,
                maxWidth: 480,
              }}
            >
              {banner.description}
            </div>
          )}
          {hasCta && (
            <a
              href={banner.callToActionUrl}
              target={banner.callToActionUrl?.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 14,
                height: compact ? 32 : 38,
                paddingLeft: compact ? 14 : 18,
                paddingRight: compact ? 14 : 18,
                borderRadius: 10,
                background: "rgba(255,255,255,0.18)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontFamily: FONT,
                fontSize: compact ? 12 : 13,
                fontWeight: 700,
                textDecoration: "none",
                backdropFilter: "blur(4px)",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onClick={(e) => {
                if (!banner.callToActionUrl || banner.callToActionUrl === "#") e.preventDefault();
              }}
            >
              {banner.callToActionLabel}
              {banner.callToActionUrl?.startsWith("http") && <ExternalLink size={12} />}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
