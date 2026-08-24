export {
  COURSE_EDITOR_TABS,
  DEFAULT_COURSE_EDITOR_TAB,
  canRoleOpen,
  homePathForRole,
  isCourseEditorTab,
  paths,
  resolvePostLoginPath,
} from "./paths";
export type { CourseEditorTab, NavSectionId } from "./paths";
export { DocumentTitleProvider, useDocumentTitleOverride } from "./document-title";
export { useRouteMeta } from "./route-meta";
export type { ResolvedRouteMeta, RouteHandle } from "./route-meta";
