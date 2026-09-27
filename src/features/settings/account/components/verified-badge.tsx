import { BadgeCheck } from "lucide-react";
import { SUCCESS } from "../../components/settings-tokens";

/** Rendered only for `emailVerified: true` from the server. */
export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ fontSize: 11, fontWeight: 700, color: SUCCESS, background: "rgba(39,174,96,0.1)" }}>
      <BadgeCheck size={12} aria-hidden /> موثّق
    </span>
  );
}
