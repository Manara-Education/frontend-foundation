import type { Profile } from "@/features/profile/types/profile.types";
import { AccountOverviewContent } from "../components/account-overview-content";
import { PhotoEditorDialog } from "../components/photo-editor-dialog";
import { useAccountOverview } from "../hooks/use-account-overview";
import { usePhotoEditor } from "../hooks/use-photo-editor";

export function AccountOverviewPage() {
  const overview = useAccountOverview();
  return (
    <>
      <AccountOverviewContent {...overview} />
      {/* Mounted only while open, so every visit starts clean and closing aborts any upload. */}
      {overview.photoOpen && overview.account ? (
        <PhotoEditor hasPhoto={!!overview.account.avatarUrl} onSaved={overview.onPhotoSaved} onClose={overview.closePhotoEditor} />
      ) : null}
    </>
  );
}

function PhotoEditor({ hasPhoto, onSaved, onClose }: { hasPhoto: boolean; onSaved: (profile: Profile) => void; onClose: () => void }) {
  const editor = usePhotoEditor({ onSaved, onClose });
  return <PhotoEditorDialog open hasPhoto={hasPhoto} {...editor} />;
}
