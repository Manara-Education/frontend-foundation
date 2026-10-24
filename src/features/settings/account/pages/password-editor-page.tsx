import { PasswordEditorContent } from "../components/password-editor-content";
import { usePasswordEditor } from "../hooks/use-password-editor";

export function PasswordEditorPage() {
  return <PasswordEditorContent {...usePasswordEditor()} />;
}
