import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichContentView } from "./components/rich-content-view";
import {
  isRichDocumentEmpty,
  parseRichDocument,
  richDocumentToPlainText,
  serializeRichDocument,
} from "./rich-content.schema";
import { resolveLinkUrl, safeHref } from "./rich-content.url";
import type { RichDocument } from "./rich-content.types";

/**
 * The renderer and the document it draws.
 *
 * The security cases here are the client half of a boundary whose authoritative half is the
 * server's sanitizer. They are worth having anyway: the server guarantees what reaches the
 * database, and these guarantee that a document reaching the renderer by any route — a stale cache,
 * a hand-crafted response, a future bug — still cannot execute.
 */

function doc(blocks: RichDocument["blocks"]): RichDocument {
  return { version: 1, blocks };
}

describe("parseRichDocument", () => {
  it("reads a stored document back into its blocks", () => {
    const parsed = parseRichDocument(
      JSON.stringify({
        version: 1,
        blocks: [
          { type: "heading", level: 2, align: "CENTER", content: [{ type: "text", text: "عنوان" }] },
          { type: "paragraph", content: [{ type: "text", text: "فقرة" }] },
        ],
      }),
    );

    expect(parsed.blocks).toHaveLength(2);
    expect(parsed.blocks[0]).toMatchObject({ type: "heading", level: 2, align: "CENTER" });
  });

  it("returns an empty document rather than throwing for anything unreadable", () => {
    // A lesson whose content cannot be read must cost the learner the body, never the page.
    for (const input of [null, undefined, "", "not json", "[]", '"string"']) {
      expect(parseRichDocument(input).blocks).toEqual([]);
    }
  });

  it("drops node types the schema has no place for", () => {
    const parsed = parseRichDocument(
      JSON.stringify({ blocks: [{ type: "iframe", src: "https://evil.example" }] }),
    );
    expect(parsed.blocks).toEqual([]);
  });

  it("drops a link whose scheme is not allowed, keeping the text it was on", () => {
    const parsed = parseRichDocument(
      JSON.stringify({
        blocks: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "اقرأ", marks: [{ type: "link", href: "javascript:alert(1)" }] },
            ],
          },
        ],
      }),
    );

    expect(parsed.blocks).toHaveLength(1);
    const block = parsed.blocks[0];
    expect(block.type).toBe("paragraph");
    if (block.type === "paragraph") {
      expect(block.content[0]).toEqual({ type: "text", text: "اقرأ" });
    }
  });

  it("drops a call-to-action pointing somewhere unsafe", () => {
    const parsed = parseRichDocument(
      JSON.stringify({
        blocks: [{ type: "cta", label: "Click", href: "javascript:alert(1)" }],
      }),
    );
    expect(parsed.blocks).toEqual([]);
  });

  it("round-trips through serialisation unchanged", () => {
    const original = doc([
      {
        type: "paragraph",
        align: "START",
        size: "NORMAL",
        leading: "NORMAL",
        spacing: "NORMAL",
        content: [{ type: "text", text: "نص", marks: [{ type: "bold" }] }],
      },
    ]);
    expect(parseRichDocument(serializeRichDocument(original))).toEqual(original);
  });
});

describe("isRichDocumentEmpty", () => {
  it("treats whitespace-only content as empty", () => {
    expect(
      isRichDocumentEmpty(
        doc([
          {
            type: "paragraph",
            align: "START",
            size: "NORMAL",
            leading: "NORMAL",
            spacing: "NORMAL",
            content: [{ type: "text", text: "   " }],
          },
        ]),
      ),
    ).toBe(true);
  });

  it("treats a lone divider as empty and a lone call-to-action as not", () => {
    expect(isRichDocumentEmpty(doc([{ type: "divider" }]))).toBe(true);
    expect(
      isRichDocumentEmpty(
        doc([{ type: "cta", label: "ابدأ", href: "https://example.com", variant: "PRIMARY", align: "START" }]),
      ),
    ).toBe(false);
  });
});

describe("resolveLinkUrl", () => {
  it.each(["https://example.com", "http://example.com/x", "mailto:t@example.com", "tel:+201234567890"])(
    "accepts %s",
    (url) => {
      expect(resolveLinkUrl(url)).toEqual({ ok: true, url });
    },
  );

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ])("refuses %s", (url) => {
    expect(resolveLinkUrl(url).ok).toBe(false);
  });

  it("tells a missing scheme apart from a malformed address", () => {
    // Different answers because they send the author to different fixes.
    expect(resolveLinkUrl("example.com")).toEqual({ ok: false, reason: "SCHEME_MISSING" });
    expect(resolveLinkUrl("javascript:x")).toEqual({ ok: false, reason: "SCHEME_UNSUPPORTED" });
  });

  it("sees through control characters hidden inside a scheme", () => {
    expect(resolveLinkUrl("java	script:alert(1)").ok).toBe(false);
    expect(resolveLinkUrl("‮javascript:alert(1)").ok).toBe(false);
  });

  it("does not rewrite the address it accepts", () => {
    const url = "https://Example.COM/Path";
    expect(resolveLinkUrl(url)).toEqual({ ok: true, url });
  });

  it("gives a renderer nothing to follow for an unsafe address", () => {
    expect(safeHref("https://example.com")).toBe("https://example.com");
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
  });
});

describe("RichContentView", () => {
  it("renders headings as real heading elements", () => {
    render(
      <RichContentView
        document={doc([
          { type: "heading", level: 2, align: "START", spacing: "NORMAL", content: [{ type: "text", text: "عنوان" }] },
        ])}
      />,
    );

    // A real <h2>, not a styled div: a learner using a screen reader navigates a lesson by these.
    expect(screen.getByRole("heading", { level: 2, name: "عنوان" })).toBeInTheDocument();
  });

  it("renders lists, quotes and dividers as their semantic elements", () => {
    const { container } = render(
      <RichContentView
        document={doc([
          {
            type: "bulletList",
            align: "START",
            spacing: "NORMAL",
            items: [{ content: [{ type: "text", text: "تحليل" }] }],
          },
          { type: "quote", align: "START", spacing: "NORMAL", content: [{ type: "text", text: "اقتباس" }] },
          { type: "divider" },
        ])}
      />,
    );

    expect(within(screen.getByRole("list")).getByText("تحليل")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toHaveTextContent("اقتباس");
    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("renders emphasis with semantic elements rather than styled spans", () => {
    const { container } = render(
      <RichContentView
        document={doc([
          {
            type: "paragraph",
            align: "START",
            size: "NORMAL",
            leading: "NORMAL",
            spacing: "NORMAL",
            content: [
              { type: "text", text: "عريض", marks: [{ type: "bold" }] },
              { type: "text", text: "مائل", marks: [{ type: "italic" }] },
            ],
          },
        ])}
      />,
    );

    expect(container.querySelector("strong")).toHaveTextContent("عريض");
    expect(container.querySelector("em")).toHaveTextContent("مائل");
  });

  it("renders a link as an anchor that cannot leak the referrer", () => {
    render(
      <RichContentView
        document={doc([
          {
            type: "paragraph",
            align: "START",
            size: "NORMAL",
            leading: "NORMAL",
            spacing: "NORMAL",
            content: [
              {
                type: "text",
                text: "اقرأ المزيد",
                marks: [{ type: "link", href: "https://example.com/critical-thinking" }],
              },
            ],
          },
        ])}
      />,
    );

    const link = screen.getByRole("link", { name: "اقرأ المزيد" });
    expect(link).toHaveAttribute("href", "https://example.com/critical-thinking");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a call-to-action as a link, never as a button", () => {
    render(
      <RichContentView
        document={doc([
          { type: "cta", label: "ابدأ التمرين", href: "https://example.com/x", variant: "PRIMARY", align: "CENTER" },
        ])}
      />,
    );

    // An anchor, so it navigates and can do nothing else. It has no handler and cannot reach
    // Manara's state, which is what keeps instructor content from completing a lesson.
    expect(screen.getByRole("link", { name: "ابدأ التمرين" })).toHaveAttribute(
      "href",
      "https://example.com/x",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("prints a script payload as text and never as markup", () => {
    const { container } = render(
      <RichContentView
        document={doc([
          {
            type: "paragraph",
            align: "START",
            size: "NORMAL",
            leading: "NORMAL",
            spacing: "NORMAL",
            content: [{ type: "text", text: "<script>alert(1)</script>" }],
          },
        ])}
      />,
    );

    // The characters are on the page; no element was created from them. React escapes text, and the
    // renderer has no path that interprets a string as HTML.
    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });

  it("renders no interactive element for a call-to-action whose destination is unsafe", () => {
    render(
      <RichContentView
        document={doc([
          { type: "cta", label: "خطر", href: "javascript:alert(1)", variant: "PRIMARY", align: "START" },
        ])}
      />,
    );

    // The label survives — silently losing part of a lesson would be worse — but there is nothing
    // to follow.
    expect(screen.getByText("خطر")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("richDocumentToPlainText", () => {
  it("flattens a document to its words", () => {
    expect(
      richDocumentToPlainText(
        doc([
          { type: "heading", level: 1, align: "START", spacing: "NORMAL", content: [{ type: "text", text: "عنوان" }] },
          {
            type: "bulletList",
            align: "START",
            spacing: "NORMAL",
            items: [{ content: [{ type: "text", text: "بند" }] }],
          },
        ]),
      ),
    ).toBe("عنوان بند");
  });
});
