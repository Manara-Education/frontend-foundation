import { EmailEditorContent } from "../components/email-editor-content";
import { useEmailEditor } from "../hooks/use-email-editor";

export function EmailEditorPage() {
  return <EmailEditorContent {...useEmailEditor()} />;
}
