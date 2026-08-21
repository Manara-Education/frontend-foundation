/**
 * Banner domain enums and the one shape both sides of the feature render.
 *
 * The enums mirror the backend enums of the same names; the wire form is uppercase.
 * They live at the feature root rather than in either sub-feature's `types/` because the
 * management screen and the learner's carousel both speak them — the instructor picks a
 * display frequency, and the carousel is what obeys it.
 */

/** What a banner is doing right now. Computed by the backend, never stored. */
export type BannerStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED" | "INACTIVE";

/**
 * How long a learner's dismissal of a banner lasts.
 *
 * The value decides where the dismissal is kept: `ONCE_PER_STUDENT` has to outlive the
 * browser and is recorded server-side, the other two are scoped to a visit and stay in
 * `sessionStorage`.
 */
export type BannerDisplayFrequency = "EVERY_VISIT" | "ONCE_PER_SESSION" | "ONCE_PER_STUDENT";

export const BANNER_STATUSES: readonly BannerStatus[] = [
  "ACTIVE",
  "SCHEDULED",
  "DRAFT",
  "EXPIRED",
  "INACTIVE",
];

export const BANNER_DISPLAY_FREQUENCIES: readonly BannerDisplayFrequency[] = [
  "EVERY_VISIT",
  "ONCE_PER_SESSION",
  "ONCE_PER_STUDENT",
];

/**
 * The fields a banner is drawn from, and nothing else.
 *
 * Every one is optional because the management screen renders this live from a half-typed
 * form, where a title exists before a description does.
 */
export interface BannerPreview {
  title?: string;
  description?: string;
  imageUrl?: string;
  callToActionLabel?: string;
  callToActionUrl?: string;
}
