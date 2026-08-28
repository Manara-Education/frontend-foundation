import type { CSSProperties, JSX, ReactNode } from "react";
import {
  CTA_VARIANT_STYLES,
  HEADING_SIZE_VALUES,
  LEADING_VALUES,
  SPACING_VALUES,
  TEXT_COLOR_VALUES,
  TEXT_SIZE_VALUES,
  alignmentToJustify,
} from "../rich-content.tokens";
import { alignmentToCss, safeHref } from "../rich-content.url";
import type {
  RichBlock,
  RichDocument,
  RichInline,
  RichListItem,
  RichMark,
} from "../rich-content.types";
import { RICH_CONTENT_STYLES } from "./rich-content.styles";

/**
 * Draws an authored lesson document.
 *
 * Used by the student lesson page and by the instructor editor's preview, so what an author is
 * shown while writing is produced by the same component learners get rather than by a second
 * approximation of it.
 *
 * <h2>Why there is no sanitizer call in this file</h2>
 * There is nothing to sanitize. Every branch below turns a tagged record into a React element this
 * component chose — a `heading` becomes an `<h2>`, a `cta` becomes an `<a>` — and instructor data
 * only ever reaches a text position or a checked `href`. `dangerouslySetInnerHTML` is not used, and
 * cannot be: there is no HTML anywhere in the model to pass to it. A document carrying
 * `<script>alert(1)</script>` as its text renders those characters as text, because React escapes
 * text, and that is the whole of the defence rather than a filter that has to keep up.
 *
 * <h2>Layout containment</h2>
 * The styling an author can apply is a colour, a size, a line height, an alignment and a bottom
 * margin — all resolved from tokens. Nothing they can express is a position, a width, a negative
 * margin or a selector, so content cannot escape the lesson body, overlap the navigation, or reach
 * anything around it. Long words and long URLs are broken by the stylesheet rather than allowed to
 * push the page sideways.
 */

export interface RichContentViewProps {
  document: RichDocument;
  /**
   * Direction for the content. Manara's lesson screens are Arabic and pass `rtl`; an author writing
   * in English inside that document still reads correctly, because every alignment is logical and
   * the browser resolves runs of Latin text on its own.
   */
  dir?: "rtl" | "ltr";
  className?: string;
}

export function RichContentView({ document, dir = "rtl", className }: RichContentViewProps) {
  return (
    <div className={className ? `mrc ${className}` : "mrc"} dir={dir}>
      <style>{RICH_CONTENT_STYLES}</style>
      {document.blocks.map((block, index) => (
        <RichBlockView key={index} block={block} />
      ))}
    </div>
  );
}

function RichBlockView({ block }: { block: RichBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p
          className="mrc-p"
          style={{
            textAlign: alignmentToCss(block.align),
            fontSize: TEXT_SIZE_VALUES[block.size],
            lineHeight: LEADING_VALUES[block.leading],
            marginBottom: SPACING_VALUES[block.spacing],
          }}
        >
          <RichInlines content={block.content} />
        </p>
      );

    case "heading": {
      // The real heading element for the level, not a styled div. A learner using a screen reader
      // navigates a lesson by its headings, and that only works if they are headings.
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag
          // The level travels as a class as well as an element, so the stylesheet can give a
          // heading the space above it that the authored token vocabulary — bottom margin only —
          // has no way to express, scaled to the level.
          className={`mrc-h mrc-h${block.level}`}
          style={{
            textAlign: alignmentToCss(block.align),
            fontSize: HEADING_SIZE_VALUES[block.level],
            marginBottom: SPACING_VALUES[block.spacing],
          }}
        >
          <RichInlines content={block.content} />
        </Tag>
      );
    }

    case "bulletList":
    case "orderedList": {
      const Tag = block.type === "bulletList" ? "ul" : "ol";
      return (
        <Tag
          className="mrc-list"
          style={{
            textAlign: alignmentToCss(block.align),
            marginBottom: SPACING_VALUES[block.spacing],
          }}
        >
          {block.items.map((item: RichListItem, index: number) => (
            <li key={index} className="mrc-li">
              <RichInlines content={item.content} />
            </li>
          ))}
        </Tag>
      );
    }

    case "quote":
      return (
        <blockquote
          className="mrc-quote"
          style={{
            textAlign: alignmentToCss(block.align),
            marginBottom: SPACING_VALUES[block.spacing],
          }}
        >
          <RichInlines content={block.content} />
        </blockquote>
      );

    case "divider":
      return <hr className="mrc-divider" />;

    case "cta":
      return <RichCta block={block} />;

    default:
      return null;
  }
}

/**
 * A call-to-action inside the lesson body.
 *
 * An anchor, not a button, and that is the point rather than a detail. It navigates and does
 * nothing else: it has no click handler, it cannot reach Manara's state, and it cannot complete a
 * lesson — which keeps instructor content and Manara's own "Mark as complete" control cleanly
 * apart even when an author styles theirs to look important.
 *
 * `rel="noopener noreferrer"` because it opens in a new tab, and `noreferrer` in particular so a
 * destination an author chose is not handed the address of the lesson the learner came from.
 */
function RichCta({ block }: { block: Extract<RichBlock, { type: "cta" }> }) {
  const href = safeHref(block.href);
  const variant = CTA_VARIANT_STYLES[block.variant];

  const style: CSSProperties = {
    background: variant.background,
    color: variant.color,
    border: variant.border,
    textDecoration: block.variant === "TEXT" ? "underline" : "none",
  };

  return (
    <div
      className="mrc-cta-row"
      style={{
        justifyContent: alignmentToJustify(block.align),
        marginBottom: SPACING_VALUES.NORMAL,
      }}
    >
      {href ? (
        <a className="mrc-cta" style={style} href={href} target="_blank" rel="noopener noreferrer">
          {block.label}
        </a>
      ) : (
        // A destination that did not pass the URL check. The label still shows — removing it would
        // silently lose part of the lesson — but there is nothing to follow.
        <span className="mrc-cta mrc-cta-inert" style={style}>
          {block.label}
        </span>
      )}
    </div>
  );
}

function RichInlines({ content }: { content: RichInline[] }) {
  return (
    <>
      {content.map((inline, index) =>
        inline.type === "break" ? <br key={index} /> : <RichText key={index} inline={inline} />,
      )}
    </>
  );
}

/**
 * One run of text with its marks applied.
 *
 * Marks are nested outwards from the innermost formatting, with the link last so it ends up as the
 * outer element. That ordering matters: a bold linked phrase has to be one anchor containing bold
 * text, not a bold element containing three anchors, or keyboard focus lands on the phrase several
 * times over.
 */
function RichText({ inline }: { inline: Extract<RichInline, { type: "text" }> }) {
  const marks = inline.marks ?? [];
  let node: ReactNode = inline.text;

  const colour = marks.find((mark): mark is Extract<RichMark, { type: "color" }> => mark.type === "color");
  if (colour) {
    node = <span style={{ color: TEXT_COLOR_VALUES[colour.value] }}>{node}</span>;
  }
  // Semantic elements rather than styled spans: `<strong>` and `<em>` carry emphasis to a screen
  // reader, and `<s>` and `<u>` say what they are.
  if (marks.some((mark) => mark.type === "strike")) node = <s>{node}</s>;
  if (marks.some((mark) => mark.type === "underline")) node = <u>{node}</u>;
  if (marks.some((mark) => mark.type === "italic")) node = <em>{node}</em>;
  if (marks.some((mark) => mark.type === "bold")) node = <strong>{node}</strong>;

  const link = marks.find((mark): mark is Extract<RichMark, { type: "link" }> => mark.type === "link");
  if (link) {
    const href = safeHref(link.href);
    if (href) {
      node = (
        <a className="mrc-link" href={href} target="_blank" rel="noopener noreferrer">
          {node}
        </a>
      );
    }
  }

  return <>{node}</>;
}
