import { InputHTMLAttributes, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  isPassword?: boolean;
}

const PRIMARY = "#4E5B92";

export function FormField({ label, error, icon, isPassword, className = "", ...props }: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? "text" : "password") : props.type;

  return (
    <div className="flex flex-col gap-2">
      <label
        style={{
          fontFamily: "'Cairo', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          color: "#2C3156",
        }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ right: 14, color: "#9BA3C4", pointerEvents: "none" }}
          >
            {icon}
          </div>
        )}
        <input
          {...props}
          type={inputType}
          className={`w-full outline-none transition-all duration-200 ${className}`}
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 400,
            fontSize: 15,
            color: "#1E2340",
            background: "#F6F7FC",
            border: `1.5px solid ${error ? "#D4183D" : "rgba(78,91,146,0.12)"}`,
            borderRadius: 12,
            padding: "13px 16px",
            paddingRight: icon ? 44 : 16,
            paddingLeft: isPassword ? 44 : 16,
            boxShadow: "none",
            ...props.style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = `1.5px solid ${PRIMARY}`;
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(78,91,146,0.10)`;
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = `1.5px solid ${error ? "#D4183D" : "rgba(78,91,146,0.12)"}`;
            e.currentTarget.style.background = "#F6F7FC";
            e.currentTarget.style.boxShadow = "none";
            props.onBlur?.(e);
          }}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 transition-colors duration-150"
            style={{ left: 14, color: "#9BA3C4" }}
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <p
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: "#D4183D",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  loading,
  disabled,
  variant = "primary",
}: PrimaryButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full transition-all duration-200 active:scale-[0.98]"
      style={{
        fontFamily: "'Cairo', sans-serif",
        fontWeight: 600,
        fontSize: 16,
        padding: "14px 24px",
        borderRadius: 12,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        background: isPrimary
          ? disabled || loading
            ? "rgba(78,91,146,0.5)"
            : "linear-gradient(135deg, #4E5B92 0%, #3A4370 100%)"
          : "transparent",
        color: isPrimary ? "#ffffff" : "#4E5B92",
        border: isPrimary ? "none" : "1.5px solid rgba(78,91,146,0.25)",
        boxShadow: isPrimary && !disabled
          ? "0 4px 16px rgba(78,91,146,0.3)"
          : "none",
        letterSpacing: 0.3,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && isPrimary) {
          e.currentTarget.style.background = "linear-gradient(135deg, #5A68A8 0%, #4E5B92 100%)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(78,91,146,0.4)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && isPrimary) {
          e.currentTarget.style.background = "linear-gradient(135deg, #4E5B92 0%, #3A4370 100%)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(78,91,146,0.3)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
          جارٍ المعالجة...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function LinkButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-colors duration-150 hover:underline"
      style={{
        fontFamily: "'Cairo', sans-serif",
        fontWeight: 600,
        fontSize: 14,
        color: "#4E5B92",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

export function Divider({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.1)" }} />
      {text && (
        <span style={{ fontFamily: "'Cairo', sans-serif", color: "#9BA3C4", fontSize: 13 }}>{text}</span>
      )}
      <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.1)" }} />
    </div>
  );
}
