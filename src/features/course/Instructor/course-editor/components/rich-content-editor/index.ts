export { RichContentEditor, isRichContentEmpty } from "./rich-content-editor";
export type { RichContentEditorProps } from "./rich-content-editor";

// Exported for tests, which exercise the translation without mounting an editor: it is pure, it is
// where a document is lost or preserved, and it is the half of the editor worth pinning down.
export { fromRichDocument, toRichDocument } from "./tiptap-bridge";
