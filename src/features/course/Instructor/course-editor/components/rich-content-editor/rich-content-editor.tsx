import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
  RICH_ALIGNMENTS,
  RICH_CTA_VARIANTS,
  isRichDocumentEmpty,
  parseRichDocument,
  resolveLinkUrl,
  serializeRichDocument,
} from "@/shared/rich-content";
import type { RichAlignment, RichCtaVariant, RichDocument } from "@/shared/rich-content";
import { CtaNodeView } from "./cta-node-view";
import { RICH_EDITOR_STYLES } from "./rich-content-editor.styles";
import { RichContentToolbar } from "./rich-content-toolbar";
import { RichBlockAttributes, RichCtaNode, RichTextColorMark } from "./tiptap-schema";
import { fromRichDocument, toRichDocument } from "./tiptap-bridge";

/**
 * The instructor's lesson-content editor.
 *
 * Built on TipTap (ProseMirror), and the reason is worth stating because it is not "a rich editor
 * was needed". What a lesson editor has to get right is the *editing model* — a selection that
 * survives formatting, Enter and Tab inside a list, an undo stack, IME composition for Arabic
 * keyboards, and paste that does not carry Word's markup into the document. Each of those is weeks
 * of work against `contenteditable` and none of them is this feature's subject. ProseMirror has
 * solved them; TipTap gives it a React binding, a typed extension API for the CTA node Manara needs,
 * and a JSON document rather than an HTML string — which is what makes the schema on both sides of
 * the wire a closed set rather than a filter over markup.
 *
 * The alternatives were weighed. Lexical is comparable and newer, with a smaller ecosystem of the
 * custom-node examples this needed; Slate leaves more of the editing model to the caller, which is
 * the part being bought here; Quill and CKEditor are HTML-first, which would have made the stored
 * document markup and every layer downstream a sanitizer. TipTap is MIT, actively maintained,
 * React 19-compatible, and ships TypeScript types.
 *
 * <h2>What TipTap is not allowed to decide</h2>
 * Its document is not Manara's. `tiptap-bridge.ts` converts, and everything TipTap can express that
 * Manara's schema cannot is dropped there. The server re-validates regardless, so the editor is a
 * convenience, never the boundary.
 *
 * <h2>Cost</h2>
 * The editor and its dependencies are only imported by the instructor lesson form. A student
 * loading a lesson downloads the renderer, which has no dependencies at all.
 */

export interface RichContentEditorProps {
  /** The stored document, as JSON. `null` for a lesson that has not been authored yet. */
  value: string | null;
  /** Called with the serialised document whenever it changes. */
  onChange: (json: string) => void;
  /** Draws the error border. The message itself belongs to the form around this. */
  invalid?: boolean;
  placeholder?: string;
}

interface CtaDraft {
  label: string;
  href: string;
  variant: RichCtaVariant;
  align: RichAlignment;
  /** True when the form is editing the CTA the cursor is on rather than adding a new one. */
  editing: boolean;
}

const CTA_VARIANT_LABELS: Record<RichCtaVariant, string> = {
  PRIMARY: "أساسي",
  SECONDARY: "ثانوي",
  OUTLINE: "محدّد",
  TEXT: "نصي",
};

const ALIGN_LABELS: Record<RichAlignment, string> = {
  START: "البداية",
  CENTER: "الوسط",
  END: "النهاية",
};

/** How a rejected URL reads to the instructor. Mirrors the server's messages for the same causes. */
function linkErrorMessage(reason: ReturnType<typeof resolveLinkUrl>): string | null {
  if (reason.ok) return null;
  switch (reason.reason) {
    case "EMPTY":
      return "يرجى إدخال وجهة الرابط";
    case "TOO_LONG":
      return "هذا الرابط طويل جدًا";
    case "SCHEME_MISSING":
      return "يجب أن يبدأ الرابط بـ https:// أو http://";
    case "SCHEME_UNSUPPORTED":
      return "هذا النوع من الروابط غير مسموح به. استخدم https:// أو http:// أو mailto: أو tel:";
    default:
      return "هذا الرابط ليس عنوانًا صحيحًا";
  }
}

export function RichContentEditor({
  value,
  onChange,
  invalid,
  placeholder = "اكتب محتوى الدرس هنا…",
}: RichContentEditorProps) {
  const [linkDraft, setLinkDraft] = useState<{ href: string } | null>(null);
  const [ctaDraft, setCtaDraft] = useState<CtaDraft | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [ctaError, setCtaError] = useState<string | null>(null);

  // Held in a ref so the TipTap `onUpdate` closure, which is created once, always calls the current
  // handler rather than the one that existed when the editor was constructed.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Opened from the CTA node view's pencil, which has no access to this component's state.
  const openCtaFormRef = useRef<() => void>(() => {});

  const initialDocument = useMemo(() => fromRichDocument(parseRichDocument(value)), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Not part of Manara's lesson vocabulary. Left in the schema they would be authorable in the
        // editor and then silently dropped by the bridge, which is worse than not offering them.
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          // TipTap's own scheme allowlist, set to Manara's. Belt and braces: the bridge checks
          // every href again, and the server checks it a third time.
          protocols: ["http", "https", "mailto", "tel"],
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder }),
      RichBlockAttributes,
      RichTextColorMark,
      RichCtaNode.extend({
        addOptions() {
          return { ...this.parent?.(), onEdit: () => openCtaFormRef.current() };
        },
        addNodeView() {
          return ReactNodeViewRenderer(CtaNodeView);
        },
      }),
    ],
    content: initialDocument,
    editorProps: {
      attributes: {
        // The surface is a labelled multi-line text box as far as assistive technology is
        // concerned, which is what makes the toolbar's controls meaningful to it.
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "محتوى الدرس",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChangeRef.current(serializeRichDocument(toRichDocument(instance.getJSON())));
    },
  });

  const openCtaForm = useCallback(() => {
    if (!editor) return;
    setCtaError(null);
    const active = editor.isActive("richCta");
    const attrs = editor.getAttributes("richCta");
    setLinkDraft(null);
    setCtaDraft({
      label: active ? String(attrs.label ?? "") : "",
      href: active ? String(attrs.href ?? "") : "",
      variant: (active ? attrs.variant : "PRIMARY") as RichCtaVariant,
      align: (active ? attrs.align : "START") as RichAlignment,
      editing: active,
    });
  }, [editor]);

  useEffect(() => {
    openCtaFormRef.current = openCtaForm;
  }, [openCtaForm]);

  const openLinkForm = useCallback(() => {
    if (!editor) return;
    setLinkError(null);
    setCtaDraft(null);
    setLinkDraft({ href: String(editor.getAttributes("link").href ?? "") });
  }, [editor]);

  if (!editor) return null;

  function applyLink(href: string) {
    if (!editor) return;
    const resolution = resolveLinkUrl(href);
    if (!resolution.ok) {
      setLinkError(linkErrorMessage(resolution));
      return;
    }
    // `extendMarkRange` so pressing the link button with the cursor inside an existing link edits
    // that whole link rather than splitting it at the caret.
    editor.chain().focus().extendMarkRange("link").setLink({ href: resolution.url }).run();
    setLinkDraft(null);
    setLinkError(null);
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkDraft(null);
    setLinkError(null);
  }

  function applyCta(draft: CtaDraft) {
    if (!editor) return;
    if (!draft.label.trim()) {
      setCtaError("يرجى إدخال نص الزر");
      return;
    }
    const resolution = resolveLinkUrl(draft.href);
    if (!resolution.ok) {
      setCtaError(linkErrorMessage(resolution));
      return;
    }

    const attrs = {
      label: draft.label.trim(),
      href: resolution.url,
      variant: draft.variant,
      align: draft.align,
    };

    if (draft.editing) {
      editor.chain().focus().updateAttributes("richCta", attrs).run();
    } else {
      editor.chain().focus().insertContent({ type: "richCta", attrs }).run();
    }
    setCtaDraft(null);
    setCtaError(null);
  }

  return (
    <div className={`mrce${invalid ? " mrce-invalid" : ""}`}>
      <style>{RICH_EDITOR_STYLES}</style>

      <RichContentToolbar editor={editor} onOpenLink={openLinkForm} onOpenCta={openCtaForm} />

      {linkDraft && (
        <div className="mrce-panel">
          <label className="mrce-field">
            <span className="mrce-label">وجهة الرابط</span>
            <input
              className="mrce-input"
              autoFocus
              dir="ltr"
              value={linkDraft.href}
              aria-invalid={linkError !== null}
              placeholder="https://example.com"
              onChange={(event) => {
                setLinkDraft({ href: event.target.value });
                setLinkError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink(linkDraft.href);
                }
                if (event.key === "Escape") setLinkDraft(null);
              }}
            />
          </label>
          <button type="button" className="mrce-btn" onClick={() => applyLink(linkDraft.href)}>
            تطبيق
          </button>
          <button type="button" className="mrce-btn" onClick={removeLink}>
            إزالة
          </button>
          <button type="button" className="mrce-btn" onClick={() => setLinkDraft(null)}>
            إلغاء
          </button>
          {linkError && (
            <span className="mrce-error" role="alert">
              {linkError}
            </span>
          )}
        </div>
      )}

      {ctaDraft && (
        <div className="mrce-panel">
          <label className="mrce-field">
            <span className="mrce-label">نص الزر</span>
            <input
              className="mrce-input"
              autoFocus
              value={ctaDraft.label}
              placeholder="ابدأ التمرين"
              onChange={(event) => {
                setCtaDraft({ ...ctaDraft, label: event.target.value });
                setCtaError(null);
              }}
            />
          </label>
          <label className="mrce-field">
            <span className="mrce-label">وجهة الزر</span>
            <input
              className="mrce-input"
              dir="ltr"
              value={ctaDraft.href}
              aria-invalid={ctaError !== null}
              placeholder="https://example.com/exercise"
              onChange={(event) => {
                setCtaDraft({ ...ctaDraft, href: event.target.value });
                setCtaError(null);
              }}
            />
          </label>
          <label className="mrce-field" style={{ flex: "0 1 130px" }}>
            <span className="mrce-label">النمط</span>
            <select
              className="mrce-select"
              value={ctaDraft.variant}
              onChange={(event) =>
                setCtaDraft({ ...ctaDraft, variant: event.target.value as RichCtaVariant })
              }
            >
              {RICH_CTA_VARIANTS.map((variant) => (
                <option key={variant} value={variant}>
                  {CTA_VARIANT_LABELS[variant]}
                </option>
              ))}
            </select>
          </label>
          <label className="mrce-field" style={{ flex: "0 1 130px" }}>
            <span className="mrce-label">المحاذاة</span>
            <select
              className="mrce-select"
              value={ctaDraft.align}
              onChange={(event) =>
                setCtaDraft({ ...ctaDraft, align: event.target.value as RichAlignment })
              }
            >
              {RICH_ALIGNMENTS.map((align) => (
                <option key={align} value={align}>
                  {ALIGN_LABELS[align]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="mrce-btn" onClick={() => applyCta(ctaDraft)}>
            {ctaDraft.editing ? "تحديث" : "إضافة"}
          </button>
          <button type="button" className="mrce-btn" onClick={() => setCtaDraft(null)}>
            إلغاء
          </button>
          {ctaError && (
            <span className="mrce-error" role="alert">
              {ctaError}
            </span>
          )}
        </div>
      )}

      <div className="mrce-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/**
 * Whether a stored document has anything in it.
 *
 * Re-exported from the editor's module so the lesson form validates with one import rather than
 * reaching into the shared schema for a single predicate.
 */
export function isRichContentEmpty(json: string | null): boolean {
  return isRichDocumentEmpty(parseRichDocument(json));
}

export type { RichDocument };
