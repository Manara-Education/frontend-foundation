import { FONT } from "@/features/landing/components/theme";
import type { CategoryColor, PublicCategory } from "../types/public-courses.types";

/** Server tokens mapped to the design palette. A dark variant sits on images. */
const PALETTE: Record<CategoryColor, { fg: string; bg: string }> = {
  indigo: { fg: "#3D4A80", bg: "#E8EBF7" },
  teal: { fg: "#0F6E6A", bg: "#DFF4F2" },
  amber: { fg: "#8A5A00", bg: "#FFF1D6" },
  rose: { fg: "#A1344F", bg: "#FCE4EA" },
  violet: { fg: "#5B3E99", bg: "#EEE7FB" },
  emerald: { fg: "#1B7A43", bg: "#DFF5E8" },
  sky: { fg: "#1F5F8F", bg: "#E0F0FB" },
  slate: { fg: "#3F4757", bg: "#ECEEF2" },
};

export function CategoryChip({ category, onImage = false }: { category: PublicCategory; onImage?: boolean }) {
  const colors = PALETTE[category.color];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        paddingInline: 10,
        paddingBlock: 3,
        borderRadius: 999,
        fontFamily: FONT,
        fontSize: 11.5,
        fontWeight: 700,
        color: colors.fg,
        background: colors.bg,
        boxShadow: onImage ? "0 2px 8px rgba(0,0,0,0.18)" : undefined,
        maxInlineSize: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {category.name}
    </span>
  );
}
