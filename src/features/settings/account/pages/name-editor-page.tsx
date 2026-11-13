import { NameEditorContent } from "../components/name-editor-content";
import { useNameEditor } from "../hooks/use-name-editor";

export function NameEditorPage() {
  return <NameEditorContent {...useNameEditor()} />;
}
