import type { ReactNode } from "react";
import { FAINT, FONT, INK, PRIMARY, SURFACE_TINT } from "../../components/settings-tokens";

interface InfoTileProps {
  label: string;
  value: ReactNode;
  /** Absent when the field cannot be edited yet; the tile then says so rather than offering a dead button. */
  onEdit?: () => void;
  editLabel: string;
  unavailableNote?: string;
}

export function InfoTile({ label, value, onEdit, editLabel, unavailableNote }: InfoTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: "#FAFBFE", border: "1.5px solid rgba(78,91,146,0.08)" }}>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 12, color: FAINT }}>{label}</p>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, marginTop: 2, overflowWrap: "anywhere" }}>{value}</div>
        {!onEdit && unavailableNote ? (
          <p style={{ fontSize: 11.5, color: FAINT, marginTop: 4 }}>{unavailableNote}</p>
        ) : null}
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl px-3.5 py-2 flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: PRIMARY, background: SURFACE_TINT, border: "none", cursor: "pointer" }}
        >
          {editLabel}
        </button>
      ) : null}
    </div>
  );
}
