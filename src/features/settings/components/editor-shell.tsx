import type { ReactNode } from "react";
import { Lightbulb, X } from "lucide-react";
import { FAINT, FONT, INK, MUTED, PRIMARY, SURFACE_TINT, cardStyle } from "./settings-tokens";

interface EditorShellProps {
  title: string;
  description: string;
  tips: readonly string[];
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}

/** A dedicated editing panel: the form, its actions, and a short aside of tips. */
export function EditorShell({ title, description, tips, onClose, children, footer }: EditorShellProps) {
  return (
    <section aria-labelledby="editor-title" className="flex flex-col" style={{ ...cardStyle, fontFamily: FONT }}>
      <header className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(78,91,146,0.08)" }}>
        <div className="flex-1 min-w-0">
          <h2 id="editor-title" style={{ fontWeight: 700, fontSize: 18, color: INK }}>{title}</h2>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{description}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="flex items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{ width: 36, height: 36, background: SURFACE_TINT, color: MUTED, border: "none", cursor: "pointer" }}
        >
          <X size={16} aria-hidden />
        </button>
      </header>

      <div className="grid gap-5 px-5 sm:px-6 py-5 lg:grid-cols-[1fr_240px]">
        <div className="flex flex-col gap-4 min-w-0">{children}</div>
        <aside aria-label="نصائح" className="rounded-2xl p-4 self-start" style={{ background: "#F6F7FC" }}>
          <p className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: 13, color: PRIMARY }}>
            <Lightbulb size={15} aria-hidden /> نصائح
          </p>
          <ul className="flex flex-col gap-2 mt-2">
            {tips.map((tip) => (
              <li key={tip} style={{ fontSize: 12.5, color: FAINT, lineHeight: 1.7 }}>{tip}</li>
            ))}
          </ul>
        </aside>
      </div>

      <footer className="flex flex-wrap gap-2.5 px-5 sm:px-6 pb-5">{footer}</footer>
    </section>
  );
}
