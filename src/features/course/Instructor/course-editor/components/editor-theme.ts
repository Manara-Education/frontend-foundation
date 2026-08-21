/**
 * The literal style tokens the reference instructor screens are drawn with.
 *
 * The prototype repeats these constants and the two inline input styles in every file;
 * collecting them here keeps the ported UI pixel-identical without copy-pasting the
 * same object into a dozen components.
 */
export const PRIMARY = "#4E5B92";
export const FONT = "'Cairo', sans-serif";

/** Create-wizard input: 46px tall, tinted once it holds a value. */
export function inputStyle(hasValue: boolean, hasError?: boolean): React.CSSProperties {
  return {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: `1.5px solid ${hasError ? "#D4183D" : hasValue ? PRIMARY : "rgba(78,91,146,0.16)"}`,
    background: hasError ? "rgba(212,24,61,0.02)" : hasValue ? "rgba(78,91,146,0.02)" : "#FAFBFD",
    paddingRight: 14,
    paddingLeft: 14,
    fontFamily: FONT,
    fontSize: 14,
    color: "#1E2340",
    outline: "none",
    boxSizing: "border-box" as const,
  };
}

/** Course-editor tab input: flat base, sized by the caller. */
export const TAB_INPUT_BASE: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1.5px solid rgba(78,91,146,0.16)",
  background: "#FAFBFD",
  fontFamily: FONT,
  fontSize: 14,
  color: "#1E2340",
  outline: "none",
  boxSizing: "border-box",
};
