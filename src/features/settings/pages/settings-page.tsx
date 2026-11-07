import { Outlet, useLocation } from "react-router";
import { SettingsNav } from "../components/settings-nav";
import { SETTINGS_SECTIONS, activeSettingsLocation } from "../settings-sections";

/** The Settings frame: the section navigation beside (or above) whichever section is open. */
export function SettingsPage() {
  const { pathname } = useLocation();
  const { sectionId, linkId } = activeSettingsLocation(pathname);

  return (
    <div dir="rtl" className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-stretch">
      <SettingsNav sections={SETTINGS_SECTIONS} activeSectionId={sectionId} activeLinkId={linkId} />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
