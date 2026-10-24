import type { ReactNode } from "react";
import { DANGER, FAINT, FONT, INK } from "../../components/settings-tokens";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  type?: string;
  autoComplete?: string;
  trailing?: ReactNode;
  describedBy?: string;
  disabled?: boolean;
}

export function TextField({ id, label, value, onChange, error, hint, type = "text", autoComplete, trailing, describedBy, disabled }: TextFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const described = [error ? errorId : null, hint ? hintId : null, describedBy ?? null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5" style={{ fontFamily: FONT }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: INK }}>{label}</label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: INK,
            background: "#fff",
            border: `1.5px solid ${error ? DANGER : "rgba(78,91,146,0.16)"}`,
            paddingInlineEnd: trailing ? 48 : undefined,
          }}
        />
        {trailing ? <div className="absolute" style={{ insetInlineEnd: 8 }}>{trailing}</div> : null}
      </div>
      {hint ? <div id={hintId} style={{ fontSize: 12, color: FAINT }}>{hint}</div> : null}
      {error ? <p id={errorId} role="alert" style={{ fontSize: 12.5, color: DANGER }}>{error}</p> : null}
    </div>
  );
}
