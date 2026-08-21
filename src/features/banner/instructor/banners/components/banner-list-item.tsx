import { useState, type ReactNode } from "react";
import { AnimatePresence, Reorder, motion, useDragControls } from "motion/react";
import {
  Copy,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import { BannerStudentPreview } from "@/features/banner/components/banner-student-preview";
import { FONT, PRIMARY } from "../formatters/banners.formatter";
import type { InstructorBanner } from "../types/banners.types";
import { BannerStatusBadge } from "./banner-status-badge";

interface BannerListItemProps {
  banner: InstructorBanner;
  pending: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
}

export function BannerListItem({
  banner,
  pending,
  onEdit,
  onDuplicate,
  onToggleEnabled,
  onDelete,
}: BannerListItemProps) {
  const [showPreview, setShowPreview] = useState(false);
  const dragControls = useDragControls();

  const actionBtn = (icon: ReactNode, label: string, onClick: () => void, danger = false) => (
    <button
      onClick={onClick}
      disabled={pending}
      title={label}
      style={{
        height: 32,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 9,
        background: "transparent",
        border: "1px solid rgba(78,91,146,0.13)",
        cursor: pending ? "default" : "pointer",
        fontFamily: FONT,
        fontSize: 12,
        color: danger ? "#D4183D" : PRIMARY,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "all 0.15s",
        opacity: pending ? 0.55 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "rgba(212,24,61,0.07)" : "rgba(78,91,146,0.07)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <Reorder.Item value={banner} dragControls={dragControls} dragListener={false} style={{ listStyle: "none" }}>
      <div
        dir="rtl"
        style={{
          background: "#fff",
          borderRadius: 18,
          border: `1.5px solid ${banner.status === "ACTIVE" ? "rgba(34,197,94,0.15)" : "rgba(78,91,146,0.1)"}`,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(78,91,146,0.05)",
        }}
      >
        {/* Thumbnail + main info */}
        <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
          {/* Drag handle */}
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              dragControls.start(e);
            }}
            style={{
              width: 36,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              color: "#C4C9DC",
              borderLeft: "1px solid rgba(78,91,146,0.07)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.color = PRIMARY;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.color = "#C4C9DC";
            }}
            title="اسحب لإعادة الترتيب"
          >
            <GripVertical size={15} strokeWidth={1.8} />
          </div>

          {/* Thumbnail */}
          <div style={{ width: 110, flexShrink: 0, position: "relative", overflow: "hidden", background: "#1E2340" }}>
            {banner.imageUrl ? (
              <ImageWithFallback
                src={banner.imageUrl}
                alt={banner.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
              />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: "rgba(255,255,255,0.2)" }}>
                <ImageIcon size={28} strokeWidth={1.2} />
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "16px 20px" }}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", marginBottom: 3 }}>
                  <span
                    style={{
                      background: "rgba(78,91,146,0.07)",
                      borderRadius: 5,
                      padding: "1px 7px",
                      color: "#717182",
                    }}
                  >
                    {banner.internalName}
                  </span>
                  <span
                    style={{
                      marginRight: 6,
                      background: "rgba(78,91,146,0.05)",
                      borderRadius: 5,
                      padding: "1px 7px",
                      color: "#B0B7D4",
                    }}
                  >
                    #{banner.priority}
                  </span>
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: "#1E2340", lineHeight: 1.4 }}>
                  {banner.title}
                </div>
              </div>
              <BannerStatusBadge status={banner.status} />
            </div>

            {banner.description && (
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 12.5,
                  color: "#717182",
                  marginBottom: 10,
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {banner.description}
              </p>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-4 mb-3">
              {[
                { label: "البدء", val: banner.startAtLabel },
                { label: "الانتهاء", val: banner.endAtLabel },
                { label: "آخر تحديث", val: banner.updatedAtLabel },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span style={{ fontFamily: FONT, fontSize: 10.5, color: "#B0B7D4" }}>{label}: </span>
                  <span style={{ fontFamily: FONT, fontSize: 11, color: "#717182", fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {actionBtn(<Eye size={12} />, "معاينة", () => setShowPreview((v) => !v))}
              {actionBtn(<Pencil size={12} />, "تعديل", onEdit)}
              {actionBtn(<Copy size={12} />, "نسخ", onDuplicate)}
              {actionBtn(
                banner.isEnabled ? <ToggleRight size={12} /> : <ToggleLeft size={12} />,
                banner.isEnabled ? "تعطيل" : "تفعيل",
                onToggleEnabled,
              )}
              {actionBtn(<Trash2 size={12} />, "حذف", onDelete, true)}
            </div>
          </div>
        </div>

        {/* Inline preview toggle */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden", borderTop: "1px solid rgba(78,91,146,0.07)" }}
            >
              <div style={{ padding: "16px 20px" }}>
                <p style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", marginBottom: 10 }}>
                  معاينة ما يراه الطالب:
                </p>
                <BannerStudentPreview banner={banner} compact />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  );
}
