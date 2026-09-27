import { useProfile } from "../hooks/use-profile.ts";
import { useInstructorHeadline } from "../hooks/use-instructor-headline.ts";
import { ProfileContent } from "../components/profile-content.tsx";
import { InstructorHeadlineSection } from "../components/instructor-headline-section.tsx";

/** The instructor's profile (students have Settings instead). */
export function ProfileView() {
  const profileData = useProfile();
  const headline = useInstructorHeadline();
  return (
    <>
      <ProfileContent {...profileData} />
      <InstructorHeadlineSection {...headline} />
    </>
  );
}
