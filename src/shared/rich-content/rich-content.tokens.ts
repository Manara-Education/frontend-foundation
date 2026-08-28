import type {
  RichAlignment,
  RichCtaVariant,
  RichLeading,
  RichSpacing,
  RichTextColor,
  RichTextSize,
} from "./rich-content.types";

/**
 * What each design token actually paints as.
 *
 * The single place a token becomes a value. Everything upstream of this file — the document model,
 * the editor, the server — deals in names, and this is where `MUTED` becomes a colour and
 * `RELAXED` becomes a line height. That indirection is the whole reason instructor styling is safe:
 * an author picks a name from a closed list, and the values it can resolve to are the ones written
 * here rather than anything they can express.
 *
 * It is also what makes the palette auditable. Contrast can be checked once, against this table,
 * instead of against whatever an open colour picker produced in three hundred lessons.
 *
 * The literals match `editor-theme.ts` and `lesson.constants.ts`, which is how a rich-content
 * lesson looks like the rest of Manara rather than like a document pasted into it.
 */

/** Manara's brand indigo, the same value the lesson and editor screens already use. */
const PRIMARY = "#4E5B92";

/**
 * Text colours, by role.
 *
 * Every one of these is a deliberate choice against Manara's white lesson surface, and each clears
 * WCAG AA for body text against it. `WARNING` is the one worth noting: the obvious amber fails
 * badly on white, so this is a darkened ochre that reads as a warning and is still legible. An open
 * colour picker is exactly how a lesson ends up with unreadable yellow text, which is why there
 * isn't one.
 */
export const TEXT_COLOR_VALUES: Record<RichTextColor, string> = {
  DEFAULT: "#1F2937",
  MUTED: "#6B7280",
  PRIMARY,
  ACCENT: "#7C3AED",
  SUCCESS: "#15803D",
  WARNING: "#B45309",
  DANGER: "#B91C1C",
};

/**
 * Body text sizes, in px. Headings size themselves from their level instead.
 *
 * `NORMAL` is a lesson's reading size, and it is sized for reading rather than for a form field:
 * an article set at interface size is legible and still tiring, which is a different failure from
 * being too small to read. Paired with the measure the lesson page holds the body to, 17px lands
 * at roughly the line length a reader can track without losing their place.
 */
export const TEXT_SIZE_VALUES: Record<RichTextSize, number> = {
  SMALL: 14,
  NORMAL: 17,
  LARGE: 19,
};

/** Line spacing, unitless so it scales with the text it is applied to. */
export const LEADING_VALUES: Record<RichLeading, number> = {
  TIGHT: 1.5,
  NORMAL: 1.9,
  RELAXED: 2.2,
  LOOSE: 2.6,
};

/**
 * Space below a block, in px.
 *
 * Margin below only, never above, and never horizontal. A block can push the next one further down
 * the page and can do nothing else — it cannot pull itself out of the lesson body, overlap what is
 * around it, or reach the layout. This is the entire vocabulary of spacing an instructor has, and
 * that is deliberate.
 */
export const SPACING_VALUES: Record<RichSpacing, number> = {
  COMPACT: 8,
  NORMAL: 16,
  ROOMY: 28,
};

/**
 * Heading sizes, in px, by level.
 *
 * The steps between them, and between level 3 and body text, are what make a lesson skimmable.
 * A heading only one or two px above the paragraph under it is a heading a reader has to stop and
 * work out, so each level is a clear jump: 30 / 24 / 20 over a 17px body. Level 3 stays closest to
 * the body and leans on its weight and darker colour to separate, which is the most a third-level
 * heading should need to do.
 */
export const HEADING_SIZE_VALUES: Record<1 | 2 | 3, number> = {
  1: 30,
  2: 24,
  3: 20,
};

/**
 * Call-to-action styling, matching the button variants Manara's instructor and student screens
 * already draw.
 */
export const CTA_VARIANT_STYLES: Record<
  RichCtaVariant,
  { background: string; color: string; border: string }
> = {
  PRIMARY: { background: PRIMARY, color: "#FFFFFF", border: `1.5px solid ${PRIMARY}` },
  SECONDARY: {
    background: "rgba(78,91,146,0.10)",
    color: PRIMARY,
    border: "1.5px solid transparent",
  },
  OUTLINE: { background: "transparent", color: PRIMARY, border: `1.5px solid ${PRIMARY}` },
  TEXT: { background: "transparent", color: PRIMARY, border: "1.5px solid transparent" },
};

/**
 * How a block's alignment token becomes `justify-content` for a block that is a flex row.
 *
 * Used by the call-to-action, whose button is centred or pushed to one side rather than having its
 * text aligned. Logical values again, so the same document reads correctly in both directions.
 */
export function alignmentToJustify(align: RichAlignment): "flex-start" | "center" | "flex-end" {
  switch (align) {
    case "CENTER":
      return "center";
    case "END":
      return "flex-end";
    default:
      return "flex-start";
  }
}
