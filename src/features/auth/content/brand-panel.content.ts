/**
 * Approved marketing copy for the authentication brand panel.
 *
 * Every authentication screen — sign in, sign up, forgot password, one-time
 * code and reset password — renders the same panel through `AuthLayout`, so
 * the copy is defined once here and imported by `BrandPanel` rather than
 * living inside the component. Changing the wording is a content edit in this
 * file; no screen has its own copy of the sentence.
 */

export interface AuthBrandPanelContent {
  /** Headline shown under the panel's logo mark. */
  heading: string;
  /** Supporting sentence. Wraps freely — it is not sized to a line count. */
  tagline: string;
}

export const AUTH_BRAND_PANEL: AuthBrandPanelContent = {
  heading: "نور العلم يضيء دروبك",
  tagline: "منصة تعليمية متكاملة تصنع منك متعلّمًا حرًا، ذكيًا، ومؤهلًا للحياة",
};
