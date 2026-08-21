import type { ReactNode } from "react";
import { CheckCircle, Clock, FileText, ToggleLeft, XCircle } from "lucide-react";
import type { BannerStatus } from "@/features/banner/types/banner.types";
import { FONT, getStatusLabel } from "../formatters/banners.formatter";

/** Colour and icon per status. The labels themselves come from the formatter. */
export const STATUS_STYLES: Record<BannerStatus, { bg: string; color: string; icon: ReactNode }> = {
  ACTIVE: { bg: "rgba(34,197,94,0.1)", color: "#15803D", icon: <CheckCircle size={12} strokeWidth={2} /> },
  SCHEDULED: { bg: "rgba(59,130,246,0.1)", color: "#1D4ED8", icon: <Clock size={12} strokeWidth={2} /> },
  DRAFT: { bg: "rgba(107,114,128,0.1)", color: "#4B5563", icon: <FileText size={12} strokeWidth={2} /> },
  EXPIRED: { bg: "rgba(245,158,11,0.1)", color: "#B45309", icon: <XCircle size={12} strokeWidth={2} /> },
  INACTIVE: { bg: "rgba(239,68,68,0.1)", color: "#B91C1C", icon: <ToggleLeft size={12} strokeWidth={2} /> },
};

export function BannerStatusBadge({ status }: { status: BannerStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="flex items-center gap-1.5"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        background: style.bg,
        color: style.color,
        fontFamily: FONT,
        fontSize: 11.5,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {style.icon} {getStatusLabel(status)}
    </span>
  );
}
