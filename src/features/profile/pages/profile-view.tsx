import { useProfile } from "../hooks/use-profile.ts";
import { ProfileContent } from "../components/profile-content.tsx";

export function ProfileView() {
  const profileData = useProfile();
  return <ProfileContent {...profileData} />;
}
