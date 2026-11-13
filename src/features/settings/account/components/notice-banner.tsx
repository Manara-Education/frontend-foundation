import { Check, X } from "lucide-react";
import { FONT, SUCCESS } from "../../components/settings-tokens";

export function NoticeBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: "rgba(39,174,96,0.09)", border: "1.5px solid rgba(39,174,96,0.18)", fontFamily: FONT }}
    >
      <Check size={16} aria-hidden style={{ color: "#27AE60" }} />
      <span className="flex-1" style={{ fontWeight: 600, fontSize: 13, color: SUCCESS }}>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="إخفاء" style={{ background: "none", border: "none", cursor: "pointer", color: SUCCESS }}>
        <X size={15} aria-hidden />
      </button>
    </div>
  );
}
