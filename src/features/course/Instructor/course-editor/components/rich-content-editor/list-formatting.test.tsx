import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { parseRichDocument, serializeRichDocument } from "@/shared/rich-content";
import { RichContentToolbar } from "./rich-content-toolbar";
import { RichBlockAttributes, RichCtaNode, RichTextColorMark } from "./tiptap-schema";
import { fromRichDocument, toRichDocument } from "./tiptap-bridge";

/**
 * Bullet and numbered lists, end to end through the editor.
 *
 * Driven through a real TipTap instance and the real toolbar rather than by asserting that a
 * command was called, because the defect these cover was never in the command. The paragraphs were
 * being converted correctly the whole time — into list nodes nobody could see, under a toolbar
 * button that reported the wrong thing. A test that stubbed the editor would have passed
 * throughout.
 *
 * What the editor produces is checked as HTML, which is the closest thing to what an instructor is
 * looking at, and as a stored Manara document, which is what survives the save.
 */

function makeEditor(paragraphs: string[]) {
  return new Editor({
    extensions: [
      // The same configuration the lesson editor mounts, so a change to it fails here rather than
      // in production.
      StarterKit.configure({ code: false, codeBlock: false }),
      RichBlockAttributes,
      RichTextColorMark,
      RichCtaNode,
    ],
    content: {
      type: "doc",
      content: paragraphs.map((text) => ({
        type: "paragraph",
        content: text ? [{ type: "text", text }] : undefined,
      })),
    } as never,
  });
}

/** The document as it would be stored, so the assertions are about what a lesson keeps. */
function stored(editor: Editor) {
  return toRichDocument(editor.getJSON());
}

/**
 * An editor with its real toolbar over it.
 *
 * The list buttons are pressed rather than the commands called, because part of what was broken
 * lives in the button: the selection it hands the command. A test that called `toggleBulletList`
 * directly would skip exactly that.
 */
function mountEditor(paragraphs: string[]) {
  const editor = makeEditor(paragraphs);
  render(<RichContentToolbar editor={editor} onOpenLink={() => {}} onOpenCta={() => {}} />);

  const bullet = screen.getByRole("button", { name: "قائمة نقطية" });
  const ordered = screen.getByRole("button", { name: "قائمة مرقّمة" });

  return {
    editor,
    bullet,
    ordered,
    selectAll: () => act(() => void editor.commands.selectAll()),
    press: (button: HTMLElement) => act(() => button.click()),
  };
}

const ARABIC = [
  "حدد وقتًا ثابتًا للتعلم.",
  "اختر هدفًا صغيرًا لكل جلسة.",
  "أبعد المشتتات أثناء الدراسة.",
];

describe("turning prose into a list", () => {
  it("converts a single paragraph into a bullet list", () => {
    const editor = makeEditor(["عنصر"]);
    editor.commands.toggleBulletList();

    expect(editor.getHTML()).toContain("<ul><li><p>عنصر</p></li></ul>");
    expect(stored(editor).blocks[0]).toMatchObject({
      type: "bulletList",
      items: [{ content: [{ type: "text", text: "عنصر" }] }],
    });
  });

  it("converts a single paragraph into an ordered list", () => {
    const editor = makeEditor(["خطوة"]);
    editor.commands.toggleOrderedList();

    expect(editor.getHTML()).toContain("<ol><li><p>خطوة</p></li></ol>");
    expect(stored(editor).blocks[0]).toMatchObject({ type: "orderedList" });
  });

  it("converts every paragraph in a multi-paragraph selection, in Arabic", () => {
    // The case in the bug report: several lines selected, one button pressed.
    const { editor, bullet, selectAll, press } = mountEditor(ARABIC);
    selectAll();
    press(bullet);

    const block = stored(editor).blocks[0];
    expect(block.type).toBe("bulletList");
    if (block.type === "bulletList") {
      expect(block.items.map((item) => (item.content[0] as { text: string }).text)).toEqual(ARABIC);
    }
  });

  it("converts every paragraph in a multi-paragraph selection, in English", () => {
    // Same document, other direction. The markup is direction-agnostic; only the stylesheet cares.
    const { editor, ordered, selectAll, press } = mountEditor(["First", "Second", "Third"]);
    selectAll();
    press(ordered);

    const block = stored(editor).blocks[0];
    expect(block.type).toBe("orderedList");
    if (block.type === "orderedList") {
      expect(block.items).toHaveLength(3);
    }
  });

  it("starts a list from an empty document and takes the text typed into it", () => {
    const editor = makeEditor([""]);
    editor.commands.toggleBulletList();
    editor.commands.insertContent("عنصر جديد");

    expect(editor.getHTML()).toContain("<ul><li><p>عنصر جديد</p></li></ul>");
  });

  it("keeps bold, colour and links across the conversion", () => {
    // Formatting is applied before a list is; losing it on conversion would make the two controls
    // mutually exclusive.
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ code: false, codeBlock: false }),
        RichBlockAttributes,
        RichTextColorMark,
        RichCtaNode,
      ],
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "عادي " },
              { type: "text", text: "غامق", marks: [{ type: "bold" }] },
              { type: "text", text: " ", marks: [] },
              {
                type: "text",
                text: "رابط",
                marks: [{ type: "link", attrs: { href: "https://example.com" } }],
              },
              {
                type: "text",
                text: "ملون",
                marks: [{ type: "richTextColor", attrs: { value: "PRIMARY" } }],
              },
            ],
          },
        ],
      } as never,
    });

    render(<RichContentToolbar editor={editor} onOpenLink={() => {}} onOpenCta={() => {}} />);
    act(() => void editor.commands.selectAll());
    act(() => screen.getByRole("button", { name: "قائمة نقطية" }).click());

    const block = stored(editor).blocks[0];
    expect(block.type).toBe("bulletList");
    if (block.type === "bulletList") {
      expect(block.items[0].content).toEqual([
        { type: "text", text: "عادي " },
        { type: "text", text: "غامق", marks: [{ type: "bold" }] },
        { type: "text", text: " " },
        { type: "text", text: "رابط", marks: [{ type: "link", href: "https://example.com" }] },
        { type: "text", text: "ملون", marks: [{ type: "color", value: "PRIMARY" }] },
      ]);
    }
  });
});

describe("turning a list back into prose", () => {
  it("turns a bullet list back into paragraphs", () => {
    // Select all, press, select all, press. The second press has to unwrap rather than wrap the
    // editor's trailing filler paragraph into a fresh empty item.
    const { editor, bullet, selectAll, press } = mountEditor(ARABIC);
    selectAll();
    press(bullet);
    selectAll();
    press(bullet);

    const blocks = stored(editor).blocks;
    expect(blocks.every((block) => block.type === "paragraph")).toBe(true);
    expect(blocks).toHaveLength(ARABIC.length);
  });

  it("turns an ordered list back into paragraphs", () => {
    const { editor, ordered, selectAll, press } = mountEditor(ARABIC);
    selectAll();
    press(ordered);
    selectAll();
    press(ordered);

    expect(stored(editor).blocks.every((block) => block.type === "paragraph")).toBe(true);
  });
});

describe("changing a list's type", () => {
  it("converts a bullet list to an ordered list without losing its text", () => {
    const { editor, bullet, ordered, selectAll, press } = mountEditor(ARABIC);
    selectAll();
    press(bullet);
    selectAll();
    press(ordered);

    const block = stored(editor).blocks[0];
    expect(block.type).toBe("orderedList");
    if (block.type === "orderedList") {
      // Every line, and no stray empty item picked up from the end of the document.
      expect(block.items.map((item) => (item.content[0] as { text: string }).text)).toEqual(ARABIC);
    }
  });

  it("converts an ordered list to a bullet list without losing its text", () => {
    const { editor, bullet, ordered, selectAll, press } = mountEditor(ARABIC);
    selectAll();
    press(ordered);
    selectAll();
    press(bullet);

    const block = stored(editor).blocks[0];
    expect(block.type).toBe("bulletList");
    if (block.type === "bulletList") {
      expect(block.items).toHaveLength(ARABIC.length);
    }
  });
});

describe("editing inside a list", () => {
  it("makes Enter start the next item and a second Enter leave the list", () => {
    const editor = makeEditor(["عنصر"]);
    editor.commands.toggleBulletList();

    // splitListItem and liftEmptyBlock are what TipTap's own Enter binding runs; calling them is
    // calling the key handler, without asking jsdom to model a keypress inside contenteditable.
    editor.commands.splitListItem("listItem");
    expect(editor.getHTML()).toContain("<li><p></p></li>");

    editor.commands.liftEmptyBlock();
    expect(editor.getHTML()).toMatch(/<\/ul>\s*<p><\/p>/);
    expect(stored(editor).blocks[0]).toMatchObject({ type: "bulletList" });
  });

  it("keeps undo and redo in step with the document", () => {
    const { editor, bullet, selectAll, press } = mountEditor(ARABIC);
    selectAll();
    press(bullet);
    expect(stored(editor).blocks[0].type).toBe("bulletList");

    editor.commands.undo();
    expect(stored(editor).blocks.every((block) => block.type === "paragraph")).toBe(true);

    editor.commands.redo();
    expect(stored(editor).blocks[0].type).toBe("bulletList");
  });
});

describe("a list that has been saved and reopened", () => {
  it("is still a list after a full save and reload", () => {
    // The whole trip: editor → stored JSON string → the string a lesson response carries → parsed
    // document → editor again. A list that survived only until the page refreshed would pass every
    // test above and still be broken for every instructor.
    const { editor, bullet, selectAll, press } = mountEditor(["عنصر أول", "عنصر ثانٍ"]);
    selectAll();
    press(bullet);

    const saved = serializeRichDocument(stored(editor));
    const reopened = new Editor({
      extensions: [
        StarterKit.configure({ code: false, codeBlock: false }),
        RichBlockAttributes,
        RichTextColorMark,
        RichCtaNode,
      ],
      content: fromRichDocument(parseRichDocument(saved)) as never,
    });

    expect(reopened.getHTML()).toContain("<ul><li><p>عنصر أول</p></li><li><p>عنصر ثانٍ</p></li></ul>");
    // And saving the reopened lesson unchanged produces the same bytes, so reopening a lesson does
    // not announce a new version of it to everyone enrolled.
    expect(serializeRichDocument(toRichDocument(reopened.getJSON()))).toEqual(saved);
  });
});

describe("the toolbar's list buttons", () => {
  function mountToolbar(editor: Editor) {
    render(<RichContentToolbar editor={editor} onOpenLink={() => {}} onOpenCta={() => {}} />);
    return {
      bullet: screen.getByRole("button", { name: "قائمة نقطية" }),
      ordered: screen.getByRole("button", { name: "قائمة مرقّمة" }),
    };
  }

  it("follows the caret in and out of a list, with no edit in between", () => {
    // The reported "the toolbar can appear active": moving the caret changes no React state, so a
    // toolbar that read the editor while rendering kept whatever it last showed.
    const editor = makeEditor(["عنصر", "فقرة"]);
    act(() => {
      editor.commands.setTextSelection(1);
      editor.commands.toggleBulletList();
    });

    const { bullet, ordered } = mountToolbar(editor);
    expect(bullet).toHaveAttribute("aria-pressed", "true");
    expect(ordered).toHaveAttribute("aria-pressed", "false");

    act(() => {
      editor.commands.setTextSelection(editor.state.doc.content.size - 2);
    });
    expect(bullet).toHaveAttribute("aria-pressed", "false");

    act(() => {
      editor.commands.setTextSelection(3);
    });
    expect(bullet).toHaveAttribute("aria-pressed", "true");
  });

  it("moves the pressed state across when the list type changes", () => {
    const editor = makeEditor(["عنصر"]);
    act(() => {
      editor.commands.toggleBulletList();
    });

    const { bullet, ordered } = mountToolbar(editor);
    expect(bullet).toHaveAttribute("aria-pressed", "true");

    act(() => {
      editor.commands.toggleOrderedList();
    });
    expect(bullet).toHaveAttribute("aria-pressed", "false");
    expect(ordered).toHaveAttribute("aria-pressed", "true");
  });

  it("does not steal the caret when pressed", () => {
    // A toolbar press that moved focus out of the surface would drop the instructor's selection
    // before the command it triggered could act on it.
    const { bullet } = mountEditor(ARABIC);
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    bullet.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
