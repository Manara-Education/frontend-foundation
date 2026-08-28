import type { JSONContent } from "@tiptap/core";
import { isSafeLinkUrl } from "@/shared/rich-content";
import type {
  RichAlignment,
  RichBlock,
  RichCtaVariant,
  RichDocument,
  RichInline,
  RichLeading,
  RichListItem,
  RichMark,
  RichSpacing,
  RichTextColor,
  RichTextSize,
} from "@/shared/rich-content";

/**
 * Translation between what TipTap holds and what Manara stores.
 *
 * These are two different documents on purpose. TipTap's JSON is ProseMirror's, shaped by whichever
 * extensions happen to be loaded, and storing it directly would make the database's contents a
 * function of the editor's configuration — an upgrade that renamed a node, or a plugin someone
 * added, would change what a lesson written last year means. Manara's document is a closed schema
 * the server owns and validates, and the editor is one program that can produce it.
 *
 * The conversion is where the two are held apart, and it is deliberately lossy in one direction:
 * anything TipTap can express that the Manara schema cannot — a code block, a table, an image, an
 * attribute from an extension added later — is dropped here rather than sent and rejected. The
 * instructor sees it disappear on save, which is honest, instead of a save that fails with a
 * message about a node type they have never heard of.
 */

// ── TipTap → Manara ───────────────────────────────────────────────────────────

function attr<T>(node: JSONContent, name: string, fallback: T): T {
  const value = node.attrs?.[name];
  return (value ?? fallback) as T;
}

function toMarks(node: JSONContent): RichMark[] {
  const marks: RichMark[] = [];
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
      case "italic":
      case "underline":
      case "strike":
        marks.push({ type: mark.type });
        break;
      case "richTextColor": {
        const value = mark.attrs?.value as RichTextColor | undefined;
        if (value && value !== "DEFAULT") marks.push({ type: "color", value });
        break;
      }
      case "link": {
        const href = mark.attrs?.href;
        // A link the URL policy would refuse becomes plain text rather than travelling. It is
        // refused on save anyway; dropping it here means the instructor loses the link, not the
        // sentence it was on.
        if (typeof href === "string" && isSafeLinkUrl(href)) marks.push({ type: "link", href });
        break;
      }
      default:
        break;
    }
  }
  return marks;
}

function toInlines(content: JSONContent[] | undefined): RichInline[] {
  const inlines: RichInline[] = [];
  for (const node of content ?? []) {
    if (node.type === "hardBreak") {
      inlines.push({ type: "break" });
      continue;
    }
    if (node.type !== "text" || typeof node.text !== "string" || node.text === "") continue;
    const marks = toMarks(node);
    inlines.push(
      marks.length > 0
        ? { type: "text", text: node.text, marks }
        : { type: "text", text: node.text },
    );
  }
  return inlines;
}

/**
 * A list item's text.
 *
 * ProseMirror wraps every list item's content in a paragraph, which Manara's schema does not have —
 * an item is a run of inline content and nothing more. Flattening it here is what keeps the stored
 * document from carrying a level of nesting that exists only because of how the editor models
 * lists.
 */
function toListItem(node: JSONContent): RichListItem | null {
  const inlines: RichInline[] = [];
  for (const child of node.content ?? []) {
    inlines.push(...toInlines(child.content));
  }
  return inlines.length > 0 ? { content: inlines } : null;
}

function toBlock(node: JSONContent): RichBlock | null {
  const align = attr<RichAlignment>(node, "align", "START");
  const spacing = attr<RichSpacing>(node, "spacing", "NORMAL");

  switch (node.type) {
    case "paragraph": {
      const content = toInlines(node.content);
      if (content.length === 0) return null;
      return {
        type: "paragraph",
        align,
        spacing,
        size: attr<RichTextSize>(node, "size", "NORMAL"),
        leading: attr<RichLeading>(node, "leading", "NORMAL"),
        content,
      };
    }
    case "heading": {
      const content = toInlines(node.content);
      if (content.length === 0) return null;
      const rawLevel = node.attrs?.level;
      const level = rawLevel === 1 || rawLevel === 2 || rawLevel === 3 ? rawLevel : 2;
      return { type: "heading", level, align, spacing, content };
    }
    case "bulletList":
    case "orderedList": {
      const items = (node.content ?? [])
        .map(toListItem)
        .filter((item): item is RichListItem => item !== null);
      if (items.length === 0) return null;
      return { type: node.type, align, spacing, items };
    }
    case "blockquote": {
      // A quote holds paragraphs in ProseMirror and inline content in Manara's schema, so its
      // paragraphs are flattened the way a list item's are.
      const content: RichInline[] = [];
      for (const child of node.content ?? []) content.push(...toInlines(child.content));
      if (content.length === 0) return null;
      return { type: "quote", align, spacing, content };
    }
    case "horizontalRule":
      return { type: "divider" };
    case "richCta": {
      const label = String(node.attrs?.label ?? "").trim();
      const href = String(node.attrs?.href ?? "");
      if (!label || !isSafeLinkUrl(href)) return null;
      return {
        type: "cta",
        label,
        href,
        variant: attr<RichCtaVariant>(node, "variant", "PRIMARY"),
        align,
      };
    }
    default:
      // Anything the Manara schema has no place for. See the file note on why this is a drop.
      return null;
  }
}

/** The Manara document a TipTap editor currently holds. */
export function toRichDocument(json: JSONContent): RichDocument {
  const blocks: RichBlock[] = [];
  for (const node of json.content ?? []) {
    const block = toBlock(node);
    if (block) blocks.push(block);
  }
  return { version: 1, blocks };
}

// ── Manara → TipTap ───────────────────────────────────────────────────────────

function fromMarks(marks: RichMark[] | undefined): JSONContent["marks"] {
  if (!marks || marks.length === 0) return undefined;
  return marks.map((mark) => {
    switch (mark.type) {
      case "color":
        return { type: "richTextColor", attrs: { value: mark.value } };
      case "link":
        return { type: "link", attrs: { href: mark.href } };
      default:
        return { type: mark.type };
    }
  });
}

function fromInlines(content: RichInline[]): JSONContent[] {
  return content.map((inline) =>
    inline.type === "break"
      ? { type: "hardBreak" }
      : { type: "text", text: inline.text, marks: fromMarks(inline.marks) },
  );
}

function fromBlock(block: RichBlock): JSONContent {
  switch (block.type) {
    case "paragraph":
      return {
        type: "paragraph",
        attrs: {
          align: block.align,
          spacing: block.spacing,
          size: block.size,
          leading: block.leading,
        },
        content: fromInlines(block.content),
      };
    case "heading":
      return {
        type: "heading",
        attrs: { level: block.level, align: block.align, spacing: block.spacing },
        content: fromInlines(block.content),
      };
    case "bulletList":
    case "orderedList":
      return {
        type: block.type,
        attrs: { align: block.align, spacing: block.spacing },
        // Each item's inline content is put back inside the paragraph ProseMirror requires.
        content: block.items.map((item) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: fromInlines(item.content) }],
        })),
      };
    case "quote":
      return {
        type: "blockquote",
        attrs: { align: block.align, spacing: block.spacing },
        content: [{ type: "paragraph", content: fromInlines(block.content) }],
      };
    case "divider":
      return { type: "horizontalRule" };
    case "cta":
      return {
        type: "richCta",
        attrs: {
          label: block.label,
          href: block.href,
          variant: block.variant,
          align: block.align,
        },
      };
  }
}

/**
 * The TipTap document for a stored Manara document.
 *
 * An empty document becomes one empty paragraph rather than nothing at all: ProseMirror requires a
 * non-empty doc, and an editor opened on a genuinely empty node has nowhere to put the cursor.
 */
export function fromRichDocument(document: RichDocument): JSONContent {
  const content = document.blocks.map(fromBlock);
  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}
