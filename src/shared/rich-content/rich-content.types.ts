/**
 * The lesson document, exactly as the backend stores it.
 *
 * Every type here mirrors `RichContentPolicy` on the server, which is the schema's owner. The
 * server validates against it and rebuilds documents from it, so this file is a client-side
 * restatement — useful for editing and rendering, never authoritative. Where the two could drift,
 * the server wins: it re-sanitizes on every write, so a document this file would allow and the
 * server would not simply never gets stored.
 *
 * Two properties are worth naming because the rest of the design rests on them.
 *
 * **Nothing here is markup.** There is no HTML string anywhere in the model, no attribute bag and
 * no style field. A document is a tree of tagged records, and the renderer turns each tag into a
 * React element it chose. That is what makes instructor content structurally unable to inject
 * anything: `dangerouslySetInnerHTML` is never reached because there is never any HTML to set.
 *
 * **Nothing here is CSS.** Presentation is expressed as design tokens — `MUTED`, `RELAXED`,
 * `CENTER` — which `rich-content.tokens.ts` resolves at paint time. An author picks from a closed
 * list of names and cannot express a pixel value, a colour or a selector, so instructor styling has
 * no way to reach the page around the lesson body.
 */

// ── Design tokens ─────────────────────────────────────────────────────────────

/**
 * Alignment, in reading order rather than in screen order.
 *
 * Deliberately never `left`/`right`. The same document is read in Arabic and in English, and a
 * paragraph aligned to the "start" is on opposite sides of the screen in the two — which is
 * correct, and is a distinction a `left` could not express without rendering one of the two
 * languages backwards.
 */
export type RichAlignment = "START" | "CENTER" | "END";

/** Line spacing. */
export type RichLeading = "TIGHT" | "NORMAL" | "RELAXED" | "LOOSE";

/** Space below a block. */
export type RichSpacing = "COMPACT" | "NORMAL" | "ROOMY";

/** Body text size. Headings size themselves from their level. */
export type RichTextSize = "SMALL" | "NORMAL" | "LARGE";

/**
 * Text colour, by role rather than by hue.
 *
 * Roles, so the same lesson stays readable in a light theme and a dark one, and so an instructor
 * cannot pick a value that vanishes against a background they never saw.
 */
export type RichTextColor =
  | "DEFAULT"
  | "MUTED"
  | "PRIMARY"
  | "ACCENT"
  | "SUCCESS"
  | "WARNING"
  | "DANGER";

/** Call-to-action styles, matching the button variants the design system already ships. */
export type RichCtaVariant = "PRIMARY" | "SECONDARY" | "OUTLINE" | "TEXT";

export const RICH_ALIGNMENTS: readonly RichAlignment[] = ["START", "CENTER", "END"];
export const RICH_LEADINGS: readonly RichLeading[] = ["TIGHT", "NORMAL", "RELAXED", "LOOSE"];
export const RICH_SPACINGS: readonly RichSpacing[] = ["COMPACT", "NORMAL", "ROOMY"];
export const RICH_TEXT_SIZES: readonly RichTextSize[] = ["SMALL", "NORMAL", "LARGE"];
export const RICH_TEXT_COLORS: readonly RichTextColor[] = [
  "DEFAULT",
  "MUTED",
  "PRIMARY",
  "ACCENT",
  "SUCCESS",
  "WARNING",
  "DANGER",
];
export const RICH_CTA_VARIANTS: readonly RichCtaVariant[] = [
  "PRIMARY",
  "SECONDARY",
  "OUTLINE",
  "TEXT",
];

/** Heading levels a lesson may use. A lesson body is not a specification. */
export type RichHeadingLevel = 1 | 2 | 3;

// ── Inline content ────────────────────────────────────────────────────────────

export type RichMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "color"; value: Exclude<RichTextColor, "DEFAULT"> }
  /** `href` has already passed the URL policy on both sides before it reaches a renderer. */
  | { type: "link"; href: string };

export type RichInline =
  | { type: "text"; text: string; marks?: RichMark[] }
  | { type: "break" };

// ── Blocks ────────────────────────────────────────────────────────────────────

export interface RichListItem {
  content: RichInline[];
}

export type RichBlock =
  | {
      type: "paragraph";
      align: RichAlignment;
      size: RichTextSize;
      leading: RichLeading;
      spacing: RichSpacing;
      content: RichInline[];
    }
  | {
      type: "heading";
      level: RichHeadingLevel;
      align: RichAlignment;
      spacing: RichSpacing;
      content: RichInline[];
    }
  | {
      type: "bulletList" | "orderedList";
      align: RichAlignment;
      spacing: RichSpacing;
      items: RichListItem[];
    }
  | {
      type: "quote";
      align: RichAlignment;
      spacing: RichSpacing;
      content: RichInline[];
    }
  | { type: "divider" }
  | {
      /**
       * A button inside the lesson body. Content, not a system action.
       *
       * Four fields and there is deliberately no fifth: no handler, no target, no class. An
       * instructor's button can navigate and nothing else, which is what keeps it from being able
       * to imitate Manara's own "Mark as complete" control by carrying its behaviour.
       */
      type: "cta";
      label: string;
      href: string;
      variant: RichCtaVariant;
      align: RichAlignment;
    };

export interface RichDocument {
  /** Schema version, stated by the server. */
  version: number;
  blocks: RichBlock[];
}

export const RICH_CONTENT_VERSION = 1;

/** A document with nothing in it, for a lesson that has not been authored yet. */
export function emptyRichDocument(): RichDocument {
  return { version: RICH_CONTENT_VERSION, blocks: [] };
}
