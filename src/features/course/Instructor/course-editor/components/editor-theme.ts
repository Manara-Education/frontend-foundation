import type { VideoProvider } from "@/shared/video";

/**
 * The literal style tokens the reference instructor screens are drawn with.
 *
 * The prototype repeats these constants and the two inline input styles in every file;
 * collecting them here keeps the ported UI pixel-identical without copy-pasting the
 * same object into a dozen components.
 */
export const PRIMARY = "#4E5B92";
export const FONT = "'Cairo', sans-serif";

/**
 * How each video platform is badged on a lesson row.
 *
 * A record keyed by provider rather than a hardcoded YouTube chip: adding a platform means adding
 * an entry here, and TypeScript points at this object if one is ever missed.
 */
export const VIDEO_PROVIDER_BADGE: Record<VideoProvider, { color: string; background: string }> = {
  YOUTUBE: { color: "#CC0000", background: "rgba(255,0,0,0.07)" },
  VIMEO: { color: "#0F7FA5", background: "rgba(26,183,234,0.10)" },
};

/** Create-wizard input: 46px tall, tinted once it holds a value. */
export function inputStyle(hasValue: boolean, hasError?: boolean): React.CSSProperties {
  return {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: `1.5px solid ${hasError ? "#D4183D" : hasValue ? PRIMARY : "rgba(78,91,146,0.16)"}`,
    background: hasError ? "rgba(212,24,61,0.02)" : hasValue ? "rgba(78,91,146,0.02)" : "#FAFBFD",
    paddingInline: 14,
    fontFamily: FONT,
    fontSize: 14,
    color: "#1E2340",
    outline: "none",
    boxSizing: "border-box" as const,
    minWidth: 0,
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
  minWidth: 0,
};
