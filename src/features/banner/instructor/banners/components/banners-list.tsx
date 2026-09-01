import type { CSSProperties } from "react";
import { AnimatePresence, Reorder, motion } from "motion/react";
import { AlertTriangle, BarChart2, Megaphone, Plus } from "lucide-react";
import type { BannerStatus } from "@/features/banner/types/banner.types";
import { BANNER_STATUSES } from "@/features/banner/types/banner.types";
import { FONT, PRIMARY, getStatusLabel } from "../formatters/banners.formatter";
import type { InstructorBanner } from "../types/banners.types";
import { BannerListItem } from "./banner-list-item";
import { STATUS_STYLES } from "./banner-status-badge";
import { DeleteBannerDialog } from "./delete-banner-dialog";

interface BannersListProps {
  banners: InstructorBanner[];
  isLoading: boolean;
  error: string | null;
  pendingId: number | null;
  bannerToDelete: InstructorBanner | null;
  activeCount: number;
  onCreateBanner: () => void;
  onEditBanner: (banner: InstructorBanner) => void;
  onDuplicate: (banner: InstructorBanner) => void;
  onToggleEnabled: (banner: InstructorBanner) => void;
  onRequestDelete: (bannerId: number) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (bannerId: number) => void;
  onReorder: (banners: InstructorBanner[]) => void;
  onRetry: () => void;
}

function AnalyticsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: "#1E2340" }}>{value}</span>
      <span style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>{label}</span>
    </div>
  );
}

export function BannersList({
  banners,
  isLoading,
  error,
  pendingId,
  bannerToDelete,
  activeCount,
  onCreateBanner,
  onEditBanner,
  onDuplicate,
  onToggleEnabled,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onReorder,
  onRetry,
}: BannersListProps) {
  if (isLoading) {
    return (
      <div dir="rtl" className="flex flex-col gap-4" style={{ fontFamily: FONT }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              minHeight: 120,
              aspectRatio: "7 / 1",
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

  const moveBanner = (bannerId: number, offset: -1 | 1) => {
    const from = banners.findIndex((banner) => banner.id === bannerId);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= banners.length) return;

    const next = [...banners];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <AnimatePresence>
        {bannerToDelete && (
          <DeleteBannerDialog
            name={bannerToDelete.internalName}
            deleting={pendingId === bannerToDelete.id}
            onConfirm={() => onConfirmDelete(bannerToDelete.id)}
            onCancel={onCancelDelete}
          />
        )}
      </AnimatePresence>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6" style={{ flexWrap: "wrap" }}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="rounded-xl flex items-center justify-center"
              style={{ width: 38, height: 38, background: "rgba(78,91,146,0.09)", color: PRIMARY }}
            >
              <Megaphone size={17} strokeWidth={1.8} />
            </div>
            <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26, color: "#1E2340", margin: 0 }}>الإعلانات</h1>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", maxWidth: 440, lineHeight: 1.65 }}>
            أنشئ إعلانات ترويجية تظهر في الصفحة الرئيسية للطلاب.{" "}
            {activeCount > 0 && <strong style={{ color: PRIMARY }}>{activeCount} إعلان نشط</strong>}
          </p>
        </div>
        <button
          onClick={onCreateBanner}
          style={{
            minHeight: 44,
            paddingInline: 22,
            borderRadius: 13,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 7,
            boxShadow: "0 4px 16px rgba(78,91,146,0.25)",
            flexShrink: 0,
          }}
        >
          <Plus size={16} /> إنشاء إعلان
        </button>
      </div>

      {/* A failed action says so where the list is, and offers the way back. */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rs-cluster"
          style={{
            "--rs-cluster-gap": "12px",
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 14,
            background: "rgba(212,24,61,0.06)",
            border: "1px solid rgba(212,24,61,0.16)",
            justifyContent: "space-between",
          } as CSSProperties}
        >
          <span
            className="flex items-center gap-2 rs-longform"
            style={{ fontFamily: FONT, fontSize: 13, color: "#B91C1C", fontWeight: 600, minWidth: 0 }}
          >
            <AlertTriangle size={15} strokeWidth={1.9} /> {error}
          </span>
          <button
            className="rs-touch"
            onClick={onRetry}
            style={{
              minHeight: 44,
              paddingInline: 14,
              borderRadius: 9,
              background: "transparent",
              border: "1px solid rgba(212,24,61,0.24)",
              color: "#B91C1C",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: 12.5,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            إعادة المحاولة
          </button>
        </motion.div>
      )}

      {/* Analytics note */}
      {activeCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginBottom: 24,
            padding: "16px 20px",
            borderRadius: 16,
            background: "rgba(78,91,146,0.04)",
            border: "1px solid rgba(78,91,146,0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={14} strokeWidth={1.8} color={PRIMARY} />
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: "#1E2340" }}>ملخص الأداء</span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 11,
                color: "#B0B7D4",
                background: "rgba(78,91,146,0.06)",
                borderRadius: 5,
                padding: "1px 8px",
                marginInlineStart: 4,
              }}
            >
              تجريبي
            </span>
          </div>
          <div className="flex gap-8 flex-wrap">
            <AnalyticsRow label="مرات الظهور" value="—" />
            <AnalyticsRow label="الطلاب الفريدون" value="—" />
            <AnalyticsRow label="نقرات الزر" value="—" />
            <AnalyticsRow label="معدل النقر" value="—" />
          </div>
          <p style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4", marginTop: 10 }}>
            تحليلات الأداء الحقيقية تتطلب تفعيل الخادم الخلفي.
          </p>
        </motion.div>
      )}

      {/* Summary stats */}
      {banners.length > 0 && (
        <div className="rs-cluster mb-6" style={{ "--rs-cluster-gap": "12px" } as CSSProperties}>
          {BANNER_STATUSES.map((status: BannerStatus) => {
            const count = banners.filter((b) => b.status === status).length;
            if (!count) return null;
            const style = STATUS_STYLES[status];
            return (
              <div
                key={status}
                style={{
                  padding: "8px 14px",
                  borderRadius: 12,
                  background: style.bg,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ color: style.color }}>{style.icon}</span>
                <span style={{ fontFamily: FONT, fontSize: 12.5, color: style.color, fontWeight: 600 }}>
                  {getStatusLabel(status)}: {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {banners.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 py-20 rounded-2xl text-center"
          style={{ background: "rgba(78,91,146,0.025)", border: "1.5px dashed rgba(78,91,146,0.18)" }}
        >
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ width: 60, height: 60, background: "rgba(78,91,146,0.09)", color: PRIMARY }}
          >
            <Megaphone size={26} strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#1E2340", marginBottom: 6 }}>
              لا توجد إعلانات بعد
            </div>
            <p
              className="rs-longform"
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: "#9BA3C4",
                maxWidth: 320,
                lineHeight: 1.7,
                margin: "0 auto",
              }}
            >
              استخدم الإعلانات للترويج للدورات والعروض والتحديثات المهمة في الصفحة الرئيسية للطلاب.
            </p>
          </div>
          <button
            onClick={onCreateBanner}
            style={{
              minHeight: 44,
              paddingInline: 24,
              borderRadius: 13,
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 4px 14px rgba(78,91,146,0.24)",
            }}
          >
            <Plus size={15} /> إنشاء أول إعلان
          </button>
        </motion.div>
      ) : (
        <Reorder.Group
          axis="y"
          values={banners}
          onReorder={onReorder}
          style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}
        >
          {banners.map((banner, index) => (
            <BannerListItem
              key={banner.id}
              banner={banner}
              pending={pendingId === banner.id}
              canMoveUp={index > 0}
              canMoveDown={index < banners.length - 1}
              onEdit={() => onEditBanner(banner)}
              onDuplicate={() => onDuplicate(banner)}
              onToggleEnabled={() => onToggleEnabled(banner)}
              onDelete={() => onRequestDelete(banner.id)}
              onMoveUp={() => moveBanner(banner.id, -1)}
              onMoveDown={() => moveBanner(banner.id, 1)}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
