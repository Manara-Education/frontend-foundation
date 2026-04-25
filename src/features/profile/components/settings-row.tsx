import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { SettingsRowProps } from "@/features/profile/types/profile.types";

const PRIMARY = "#4E5B92";
const PRIMARY_LIGHT = "rgba(78,91,146,0.08)";

export function SettingsRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  description,
  onClick,
}: SettingsRowProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-4 w-full px-5 py-4 text-right transition-colors duration-150"
      style={{ background: hovered ? PRIMARY_LIGHT : "transparent", border: "none", cursor: "pointer" }}
    >
      <div className="flex items-center justify-center flex-shrink-0 rounded-xl" style={{ width: 40, height: 40, background: hovered ? iconColor + "22" : iconBg, color: iconColor, transition: "background 0.15s" }}>
        <Icon size={17} />
      </div>
      <div className="flex flex-col gap-0.5 flex-1">
        <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, color: "#1E2340" }}>{label}</span>
        {description && (
          <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 400, fontSize: 11, color: "#9BA3C4" }}>{description}</span>
        )}
      </div>
      <ChevronLeft size={15} style={{ color: hovered ? PRIMARY : "#C4C9DC", transition: "color 0.15s, transform 0.15s", transform: hovered ? "translateX(-3px)" : "translateX(0)", flexShrink: 0 }} />
    </button>
  );
}
