import { describe, expect, it } from "vitest";
import { fromRichDocument, toRichDocument } from "./tiptap-bridge";
import type { RichDocument } from "@/shared/rich-content";

/**
 * The translation between TipTap's document and Manara's.
 *
 * Tested directly rather than through a mounted editor. It is pure, it is where a lesson's content
 * is preserved or lost, and driving a real ProseMirror instance in jsdom would test the editor
 * rather than the conversion.
 */

describe("toRichDocument", () => {
  it("converts prose, structure and marks", () => {
    const result = toRichDocument({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1, align: "CENTER", spacing: "ROOMY" },
          content: [{ type: "text", text: "عنوان" }],
        },
        {
          type: "paragraph",
          attrs: { size: "LARGE", leading: "RELAXED" },
          content: [
            { type: "text", text: "غامق", marks: [{ type: "bold" }] },
            { type: "text", text: "ملون", marks: [{ type: "richTextColor", attrs: { value: "PRIMARY" } }] },
          ],
        },
      ],
    });

    expect(result.blocks[0]).toMatchObject({ type: "heading", level: 1, align: "CENTER", spacing: "ROOMY" });
    expect(result.blocks[1]).toMatchObject({ type: "paragraph", size: "LARGE", leading: "RELAXED" });
    const paragraph = result.blocks[1];
    if (paragraph.type === "paragraph") {
      expect(paragraph.content[0]).toMatchObject({ marks: [{ type: "bold" }] });
      expect(paragraph.content[1]).toMatchObject({ marks: [{ type: "color", value: "PRIMARY" }] });
    }
  });

  it("flattens the paragraph ProseMirror wraps each list item in", () => {
    const result = toRichDocument({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "بند" }] }] },
          ],
        },
      ],
    });

    // Manara's schema has no paragraph inside a list item; carrying one would store a level of
    // nesting that exists only because of how the editor models lists.
    expect(result.blocks[0]).toEqual({
      type: "bulletList",
      align: "START",
      spacing: "NORMAL",
      items: [{ content: [{ type: "text", text: "بند" }] }],
    });
  });

  it("keeps the text of a nested list item, as a sibling", () => {
    // TipTap binds Tab to "sink list item", so an instructor can indent while writing, and Manara's
    // stored document has no nested list to put the result in. Losing the indentation is the price
    // of a schema that never offered it; losing the words would be losing their work.
    const result = toRichDocument({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "رئيسي" }] },
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [{ type: "paragraph", content: [{ type: "text", text: "متداخل" }] }],
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "تالٍ" }] }],
            },
          ],
        },
      ],
    });

    const block = result.blocks[0];
    expect(block.type).toBe("bulletList");
    if (block.type === "bulletList") {
      // Reading order: an item's children follow it rather than collecting at the end.
      expect(block.items.map((item) => (item.content[0] as { text: string }).text)).toEqual([
        "رئيسي",
        "متداخل",
        "تالٍ",
      ]);
    }
  });

  it("drops anything TipTap can express that Manara's schema cannot", () => {
    const result = toRichDocument({
      type: "doc",
      content: [
        { type: "codeBlock", content: [{ type: "text", text: "console.log(1)" }] },
        { type: "image", attrs: { src: "https://example.com/x.png" } },
        { type: "table" },
        { type: "paragraph", content: [{ type: "text", text: "يبقى" }] },
      ],
    });

    // Dropped here rather than sent and rejected: an instructor sees it disappear on save, which is
    // honest, instead of a save that fails naming a node type they have never heard of.
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0]).toMatchObject({ type: "paragraph" });
  });

  it("drops a link the URL policy would refuse, keeping its text", () => {
    const result = toRichDocument({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "اضغط", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] },
          ],
        },
      ],
    });

    const block = result.blocks[0];
    expect(block.type).toBe("paragraph");
    if (block.type === "paragraph") {
      expect(block.content[0]).toEqual({ type: "text", text: "اضغط" });
    }
  });

  it("drops a call-to-action that is missing its label or points somewhere unsafe", () => {
    const result = toRichDocument({
      type: "doc",
      content: [
        { type: "richCta", attrs: { label: "", href: "https://example.com" } },
        { type: "richCta", attrs: { label: "خطر", href: "javascript:alert(1)" } },
        { type: "richCta", attrs: { label: "ابدأ", href: "https://example.com/x", variant: "OUTLINE" } },
      ],
    });

    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0]).toMatchObject({ type: "cta", label: "ابدأ", variant: "OUTLINE" });
  });

  it("drops blocks with no content rather than storing empty ones", () => {
    const result = toRichDocument({
      type: "doc",
      content: [
        { type: "paragraph" },
        { type: "paragraph", content: [] },
        { type: "heading", attrs: { level: 2 }, content: [] },
      ],
    });

    expect(result.blocks).toEqual([]);
  });
});

describe("fromRichDocument", () => {
  it("puts a list item's content back inside the paragraph ProseMirror requires", () => {
    const result = fromRichDocument({
      version: 1,
      blocks: [
        {
          type: "orderedList",
          align: "START",
          spacing: "NORMAL",
          items: [{ content: [{ type: "text", text: "أولًا" }] }],
        },
      ],
    });

    expect(result.content?.[0]).toMatchObject({
      type: "orderedList",
      content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "أولًا" }] }] },
      ],
    });
  });

  it("gives an empty document one empty paragraph to put a cursor in", () => {
    // ProseMirror requires a non-empty doc, and an editor opened on nothing has nowhere to type.
    expect(fromRichDocument({ version: 1, blocks: [] })).toEqual({
      type: "doc",
      content: [{ type: "paragraph" }],
    });
  });

  it("round-trips a document through TipTap and back unchanged", () => {
    const original: RichDocument = {
      version: 1,
      blocks: [
        { type: "heading", level: 2, align: "CENTER", spacing: "NORMAL", content: [{ type: "text", text: "عنوان" }] },
        {
          type: "paragraph",
          align: "START",
          size: "NORMAL",
          leading: "NORMAL",
          spacing: "NORMAL",
          content: [
            { type: "text", text: "نص", marks: [{ type: "bold" }, { type: "link", href: "https://example.com" }] },
            { type: "break" },
            { type: "text", text: "more" },
          ],
        },
        {
          type: "bulletList",
          align: "START",
          spacing: "NORMAL",
          items: [{ content: [{ type: "text", text: "بند" }] }],
        },
        { type: "quote", align: "START", spacing: "NORMAL", content: [{ type: "text", text: "اقتباس" }] },
        { type: "divider" },
        { type: "cta", label: "ابدأ", href: "https://example.com/x", variant: "PRIMARY", align: "CENTER" },
      ],
    };

    // The property that matters: opening a saved lesson in the editor and saving it again must not
    // change a byte, or every instructor who opened a lesson would announce a new version of the
    // course to everyone enrolled in it.
    expect(toRichDocument(fromRichDocument(original))).toEqual(original);
  });
});
