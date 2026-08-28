import { isSafeLinkUrl } from "./rich-content.url";
import {
  RICH_ALIGNMENTS,
  RICH_CONTENT_VERSION,
  RICH_CTA_VARIANTS,
  RICH_LEADINGS,
  RICH_SPACINGS,
  RICH_TEXT_COLORS,
  RICH_TEXT_SIZES,
  emptyRichDocument,
  type RichAlignment,
  type RichBlock,
  type RichCtaVariant,
  type RichDocument,
  type RichHeadingLevel,
  type RichInline,
  type RichLeading,
  type RichListItem,
  type RichMark,
  type RichSpacing,
  type RichTextColor,
  type RichTextSize,
} from "./rich-content.types";

/**
 * Reading and writing the stored lesson document.
 *
 * The document travels as a JSON string in `LessonResponse.richContent`, because that is the form
 * the server can hold canonically — the exact bytes it compares to decide whether an instructor's
 * save changed anything a learner should be told about. Parsing it here rather than in each screen
 * keeps a malformed or unexpected document from taking a lesson page down with it.
 *
 * `parseRichDocument` is deliberately forgiving in one direction only: anything it does not
 * recognise is dropped, never rendered. It cannot be lenient about content, because whatever it
 * returns is what gets drawn, and it is trivially strict about structure, because the document was
 * built by the server's sanitizer and any deviation from that shape is a bug rather than a case to
 * support.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function token<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof value !== "string") return fallback;
  const upper = value.trim().toUpperCase() as T;
  return allowed.includes(upper) ? upper : fallback;
}

function parseMarks(value: unknown): RichMark[] {
  if (!Array.isArray(value)) return [];
  const marks: RichMark[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    switch (raw.type) {
      case "bold":
      case "italic":
      case "underline":
      case "strike":
        marks.push({ type: raw.type });
        break;
      case "color": {
        const colour = token<RichTextColor>(raw.value, RICH_TEXT_COLORS, "DEFAULT");
        // `DEFAULT` is what text already is, so the server never stores it as a mark.
        if (colour !== "DEFAULT") marks.push({ type: "color", value: colour });
        break;
      }
      case "link":
        // Re-checked on the way in even though the server checked it on the way out. The cost is a
        // string comparison, and the alternative is trusting a response body with an `href`.
        if (typeof raw.href === "string" && isSafeLinkUrl(raw.href)) {
          marks.push({ type: "link", href: raw.href });
        }
        break;
      default:
        break;
    }
  }
  return marks;
}

function parseInlines(value: unknown): RichInline[] {
  if (!Array.isArray(value)) return [];
  const inlines: RichInline[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    if (raw.type === "break") {
      inlines.push({ type: "break" });
      continue;
    }
    if (raw.type !== "text" || typeof raw.text !== "string" || raw.text === "") continue;
    const marks = parseMarks(raw.marks);
    inlines.push(marks.length > 0 ? { type: "text", text: raw.text, marks } : { type: "text", text: raw.text });
  }
  return inlines;
}

function parseListItems(value: unknown): RichListItem[] {
  if (!Array.isArray(value)) return [];
  const items: RichListItem[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const content = parseInlines(raw.content);
    if (content.length > 0) items.push({ content });
  }
  return items;
}

function parseBlock(raw: unknown): RichBlock | null {
  if (!isRecord(raw)) return null;

  const align = token<RichAlignment>(raw.align, RICH_ALIGNMENTS, "START");
  const spacing = token<RichSpacing>(raw.spacing, RICH_SPACINGS, "NORMAL");

  switch (raw.type) {
    case "paragraph": {
      const content = parseInlines(raw.content);
      if (content.length === 0) return null;
      return {
        type: "paragraph",
        align,
        spacing,
        size: token<RichTextSize>(raw.size, RICH_TEXT_SIZES, "NORMAL"),
        leading: token<RichLeading>(raw.leading, RICH_LEADINGS, "NORMAL"),
        content,
      };
    }
    case "heading": {
      const content = parseInlines(raw.content);
      if (content.length === 0) return null;
      const level: RichHeadingLevel =
        raw.level === 1 || raw.level === 2 || raw.level === 3 ? raw.level : 2;
      return { type: "heading", level, align, spacing, content };
    }
    case "bulletList":
    case "orderedList": {
      const items = parseListItems(raw.items);
      if (items.length === 0) return null;
      return { type: raw.type, align, spacing, items };
    }
    case "quote": {
      const content = parseInlines(raw.content);
      if (content.length === 0) return null;
      return { type: "quote", align, spacing, content };
    }
    case "divider":
      return { type: "divider" };
    case "cta": {
      // A button with no label is invisible and one with no destination is a dead end. The server
      // refuses both, so neither should arrive; a document that somehow carries one drops it rather
      // than drawing something unusable.
      if (typeof raw.label !== "string" || raw.label.trim() === "") return null;
      if (typeof raw.href !== "string" || !isSafeLinkUrl(raw.href)) return null;
      return {
        type: "cta",
        label: raw.label.trim(),
        href: raw.href,
        variant: token<RichCtaVariant>(raw.variant, RICH_CTA_VARIANTS, "PRIMARY"),
        align,
      };
    }
    default:
      return null;
  }
}

/**
 * Reads a stored document.
 *
 * Returns an empty document rather than throwing for anything it cannot read. A lesson whose
 * content is unreadable should render as a lesson with nothing in it — which the caller can say
 * something about — and never as a page that failed to load.
 */
export function parseRichDocument(json: string | null | undefined): RichDocument {
  if (!json) return emptyRichDocument();

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return emptyRichDocument();
  }
  if (!isRecord(parsed)) return emptyRichDocument();

  const blocks: RichBlock[] = [];
  if (Array.isArray(parsed.blocks)) {
    for (const raw of parsed.blocks) {
      const block = parseBlock(raw);
      if (block) blocks.push(block);
    }
  }

  return {
    version: typeof parsed.version === "number" ? parsed.version : RICH_CONTENT_VERSION,
    blocks,
  };
}

/** Serialises a document for the API. The server re-sanitizes it whatever this produces. */
export function serializeRichDocument(document: RichDocument): string {
  return JSON.stringify({ version: RICH_CONTENT_VERSION, blocks: document.blocks });
}

/**
 * Whether a document has anything a learner could read.
 *
 * The same judgement the server makes, so the editor can refuse to save a lesson before the round
 * trip rather than after it. Text that is only whitespace does not count, so a page of empty
 * paragraphs is empty however many of them there are. A call-to-action counts on its own: a lesson
 * that is one "Start the exercise" button is thin, but it is something someone chose to publish.
 */
export function isRichDocumentEmpty(document: RichDocument): boolean {
  // A switch rather than an if-chain: it narrows the block union exhaustively, so adding a block
  // type to the model makes this fail to compile rather than quietly count as empty.
  return !document.blocks.some((block) => {
    switch (block.type) {
      case "cta":
        return true;
      case "divider":
        return false;
      case "bulletList":
      case "orderedList":
        return block.items.some((item) => hasText(item.content));
      default:
        return hasText(block.content);
    }
  });
}

function hasText(content: RichInline[]): boolean {
  return content.some((inline) => inline.type === "text" && inline.text.trim() !== "");
}

/**
 * The document's text, with no formatting.
 *
 * For places that need to say what a lesson is about in one line — a card, a preview, a summary —
 * without rendering it. Blocks are joined with a space so words from adjacent blocks do not run
 * together.
 */
export function richDocumentToPlainText(document: RichDocument): string {
  const parts: string[] = [];
  for (const block of document.blocks) {
    switch (block.type) {
      case "cta":
        parts.push(block.label);
        break;
      case "divider":
        break;
      case "bulletList":
      case "orderedList":
        for (const item of block.items) parts.push(inlineText(item.content));
        break;
      default:
        parts.push(inlineText(block.content));
    }
  }
  return parts.filter((part) => part.trim() !== "").join(" ").trim();
}

function inlineText(content: RichInline[]): string {
  return content.map((inline) => (inline.type === "text" ? inline.text : " ")).join("");
}
