import type { ButtonHTMLAttributes } from "react";
import { FONT, MUTED, PRIMARY } from "./settings-tokens";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function ActionButton({ variant = "primary", style, disabled, ...props }: ActionButtonProps) {
  const primary = variant === "primary";
  return (
    <button
      type="button"
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4E5B92] disabled:cursor-not-allowed"
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 13,
        border: primary ? "none" : "1.5px solid rgba(78,91,146,0.12)",
        background: primary ? PRIMARY : "rgba(78,91,146,0.06)",
        color: primary ? "#fff" : MUTED,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...props}
    />
  );
}
