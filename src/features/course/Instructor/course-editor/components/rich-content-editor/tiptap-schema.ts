import { Extension, Mark, Node, mergeAttributes } from "@tiptap/core";
import {
  LEADING_VALUES,
  SPACING_VALUES,
  TEXT_COLOR_VALUES,
  TEXT_SIZE_VALUES,
  RICH_ALIGNMENTS,
  RICH_CTA_VARIANTS,
  RICH_LEADINGS,
  RICH_SPACINGS,
  RICH_TEXT_COLORS,
  RICH_TEXT_SIZES,
  alignmentToCss,
} from "@/shared/rich-content";
import type {
  RichAlignment,
  RichCtaVariant,
  RichLeading,
  RichSpacing,
  RichTextColor,
} from "@/shared/rich-content";

/**
 * The Manara additions to TipTap's schema.
 *
 * TipTap ships everything structural a lesson needs — paragraphs, headings, lists, quotes, rules,
 * the four text marks, links and history. What it does not ship is Manara's constraint, and that is
 * all this file adds:
 *
 * * **Token attributes** rather than free styling. TipTap's own `TextAlign` and `Color` extensions
 *   store a CSS value — `left`, `#ff0000` — and both are wrong here. `left` cannot describe a
 *   document read in two directions, and an arbitrary colour is the thing the design forbids. These
 *   store the token and let the renderer resolve it.
 *
 * * **A call-to-action node**, so a button is a first-class thing in the document with a label, a
 *   destination and two tokens, rather than a link that has been styled to look like one.
 *
 * Nothing here can produce a value outside the closed sets in `RichContentPolicy`, and everything
 * is re-checked by the server regardless. The editor's job is to make the right document easy to
 * author; the server's job is to make the wrong one impossible to store.
 */

/** The block types that carry Manara's presentation tokens. */
const STYLED_BLOCKS = ["paragraph", "heading", "bulletList", "orderedList", "blockquote"];

function tokenAttribute<T extends string>(
  allowed: readonly T[],
  fallback: T,
  dataAttribute: string,
) {
  return {
    default: fallback,
    parseHTML: (element: HTMLElement): T => {
      const value = element.getAttribute(dataAttribute);
      return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
    },
    renderHTML: (attributes: Record<string, unknown>) => {
      const value = attributes[dataAttribute.replace("data-", "")];
      return typeof value === "string" ? { [dataAttribute]: value } : {};
    },
  };
}

/**
 * Alignment, spacing and — on paragraphs — size and line height, as tokens on every block.
 *
 * Added as global attributes rather than by subclassing five node types, so a block type added
 * later picks them up by being named in `STYLED_BLOCKS`.
 *
 * The `style` written here is for the editing surface only: it is what makes the instructor's
 * choice visible while they work. It is never what a learner sees — the student renderer builds its
 * own styles from the same tokens — so the two cannot drift into a preview that lies.
 */
export const RichBlockAttributes = Extension.create({
  name: "manaraBlockAttributes",

  addGlobalAttributes() {
    return [
      {
        types: STYLED_BLOCKS,
        attributes: {
          align: {
            ...tokenAttribute<RichAlignment>(RICH_ALIGNMENTS, "START", "data-align"),
            renderHTML: (attributes: Record<string, unknown>) => {
              const align = attributes.align as RichAlignment | undefined;
              if (!align || align === "START") return {};
              return {
                "data-align": align,
                style: `text-align:${alignmentToCss(align)}`,
              };
            },
          },
          spacing: {
            ...tokenAttribute<RichSpacing>(RICH_SPACINGS, "NORMAL", "data-spacing"),
            renderHTML: (attributes: Record<string, unknown>) => {
              const spacing = attributes.spacing as RichSpacing | undefined;
              if (!spacing || spacing === "NORMAL") return {};
              return {
                "data-spacing": spacing,
                style: `margin-bottom:${SPACING_VALUES[spacing]}px`,
              };
            },
          },
        },
      },
      {
        // Body-text controls. A heading takes its size from its level, so offering these on one
        // would let an instructor make an H1 smaller than the paragraph under it.
        types: ["paragraph"],
        attributes: {
          size: {
            ...tokenAttribute<"SMALL" | "NORMAL" | "LARGE">(RICH_TEXT_SIZES, "NORMAL", "data-size"),
            renderHTML: (attributes: Record<string, unknown>) => {
              const size = attributes.size as keyof typeof TEXT_SIZE_VALUES | undefined;
              if (!size || size === "NORMAL") return {};
              return { "data-size": size, style: `font-size:${TEXT_SIZE_VALUES[size]}px` };
            },
          },
          leading: {
            ...tokenAttribute<RichLeading>(RICH_LEADINGS, "NORMAL", "data-leading"),
            renderHTML: (attributes: Record<string, unknown>) => {
              const leading = attributes.leading as RichLeading | undefined;
              if (!leading || leading === "NORMAL") return {};
              return {
                "data-leading": leading,
                style: `line-height:${LEADING_VALUES[leading]}`,
              };
            },
          },
        },
      },
    ];
  },
});

/**
 * Text colour as a role name.
 *
 * Deliberately not TipTap's `Color`, which stores whatever CSS colour it is handed. A document that
 * held `#f5f5f5` would be invisible on Manara's white lesson surface and there would be no way to
 * tell, at any layer, that it was wrong. A document that holds `MUTED` renders as whatever the
 * design system says muted is, on the surface doing the rendering, in either theme.
 */
export const RichTextColorMark = Mark.create({
  name: "richTextColor",

  addAttributes() {
    return {
      value: {
        default: "DEFAULT" as RichTextColor,
        parseHTML: (element: HTMLElement): RichTextColor => {
          const value = element.getAttribute("data-color");
          return value && (RICH_TEXT_COLORS as readonly string[]).includes(value)
            ? (value as RichTextColor)
            : "DEFAULT";
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          const value = attributes.value as RichTextColor | undefined;
          if (!value || value === "DEFAULT") return {};
          return { "data-color": value, style: `color:${TEXT_COLOR_VALUES[value]}` };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-color]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});

export interface CtaAttributes {
  label: string;
  href: string;
  variant: RichCtaVariant;
  align: RichAlignment;
}

/**
 * A call-to-action button, as a node.
 *
 * An atom: it has no editable children, so the label is changed through the button's own form
 * rather than by typing into the document. That is what keeps the four fields a closed set — there
 * is no position inside a CTA for anything else to end up.
 *
 * A block-level node rather than an inline one, because a button that could sit mid-sentence would
 * have to reflow with the text around it in two directions, and no lesson needs it to.
 */
export const RichCtaNode = Node.create({
  name: "richCta",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      label: { default: "" },
      href: { default: "" },
      variant: {
        default: "PRIMARY" as RichCtaVariant,
        parseHTML: (element: HTMLElement): RichCtaVariant => {
          const value = element.getAttribute("data-variant");
          return value && (RICH_CTA_VARIANTS as readonly string[]).includes(value)
            ? (value as RichCtaVariant)
            : "PRIMARY";
        },
      },
      align: {
        default: "START" as RichAlignment,
        parseHTML: (element: HTMLElement): RichAlignment => {
          const value = element.getAttribute("data-align");
          return value && (RICH_ALIGNMENTS as readonly string[]).includes(value)
            ? (value as RichAlignment)
            : "START";
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-rich-cta]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-rich-cta": "" })];
  },
});
