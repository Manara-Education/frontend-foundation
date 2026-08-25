import { useState } from "react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";

interface CheckoutFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  fieldDir?: string;
}

export function CheckoutField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  fieldDir = "ltr",
}: CheckoutFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: FONT, fontSize: 11, color: "#6B7280", display: "block", marginBottom: 5, textAlign: "right" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          dir={fieldDir}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 46,
            borderRadius: 11,
            border: `1.5px solid ${focused ? PRIMARY : "#E5E7EB"}`,
            background: "#FAFAFA",
            paddingLeft: "14px",
            paddingRight: "14px",
            fontFamily: "monospace, 'Cairo', sans-serif",
            fontSize: 14,
            color: "#1F2937",
            outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(78,91,146,0.09)" : "none",
            transition: "border-color 0.16s, box-shadow 0.16s",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}
