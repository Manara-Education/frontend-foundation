import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Pencil, Trash2 } from "lucide-react";
import { CTA_VARIANT_STYLES, alignmentToJustify } from "@/shared/rich-content";
import type { RichAlignment, RichCtaVariant } from "@/shared/rich-content";

/**
 * How a call-to-action looks and behaves inside the editor.
 *
 * It is drawn as the button it will become, using the same variant tokens the student renderer
 * resolves, so an instructor is choosing between things they can see rather than between four
 * words. What it is *not* is a working link: clicking it in the editor selects the node, and the
 * two controls beside it edit and remove it. A button that navigated away mid-edit would take the
 * instructor out of the lesson they were writing.
 *
 * The node is an atom, so there is no text cursor inside it; the label is changed through the form
 * this opens.
 */
export function CtaNodeView({ node, selected, deleteNode, extension }: NodeViewProps) {
  const label = String(node.attrs.label ?? "");
  const variant = (node.attrs.variant ?? "PRIMARY") as RichCtaVariant;
  const align = (node.attrs.align ?? "START") as RichAlignment;
  const style = CTA_VARIANT_STYLES[variant] ?? CTA_VARIANT_STYLES.PRIMARY;

  // Supplied by the editor when it registers the extension, so the node view can ask the editor to
  // open its button form rather than owning a form of its own.
  const onEdit = extension.options.onEdit as (() => void) | undefined;

  return (
    <NodeViewWrapper
      className={`mrce-cta-node${selected ? " is-selected" : ""}`}
      style={{ justifyContent: alignmentToJustify(align) }}
    >
      <span
        className="mrce-cta-preview"
        style={{ background: style.background, color: style.color, border: style.border }}
      >
        {label}
      </span>

      {/*
        `contentEditable={false}` on the controls: without it ProseMirror treats the buttons as part
        of the document and typing near them can put text inside the toolbar.
      */}
      <span className="mrce-cta-actions" contentEditable={false}>
        <button
          type="button"
          className="mrce-btn"
          onClick={() => onEdit?.()}
          aria-label={`تعديل الزر: ${label}`}
          title="تعديل الزر"
        >
          <Pencil size={13} strokeWidth={1.9} />
        </button>
        <button
          type="button"
          className="mrce-btn"
          onClick={() => deleteNode()}
          aria-label={`حذف الزر: ${label}`}
          title="حذف الزر"
        >
          <Trash2 size={13} strokeWidth={1.9} />
        </button>
      </span>
    </NodeViewWrapper>
  );
}
