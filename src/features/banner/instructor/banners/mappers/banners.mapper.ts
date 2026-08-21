import {
  addDays,
  formatDateAr,
  formatDateInput,
  formatTimeInput,
  nowAsLocalDateTime,
  toDuplicateName,
  toLocalDateTime,
} from "../formatters/banners.formatter";
import type {
  BannerFormState,
  BannerRequest,
  BannerResponse,
  BannerSaveAction,
  InstructorBanner,
} from "../types/banners.types";

const DEFAULT_TIMEZONE = "Asia/Riyadh";

/** The editor has no position control, so its form always holds the same placeholder. */
const DEFAULT_FORM_PRIORITY = 1;

/** The DTO's nullable optionals, as the `undefined` the rest of the feature expects. */
function optional(value: string | null | undefined): string | undefined {
  return value ?? undefined;
}

export function toInstructorBanner(dto: BannerResponse): InstructorBanner {
  return {
    id: dto.id,
    internalName: dto.internalName,
    title: dto.title,
    description: optional(dto.description),
    imageUrl: optional(dto.imageUrl),
    callToActionLabel: optional(dto.callToActionLabel),
    callToActionUrl: optional(dto.callToActionUrl),
    startAt: optional(dto.startAt),
    endAt: optional(dto.endAt),
    timezone: dto.timezone,
    priority: dto.priority,
    isEnabled: dto.enabled,
    isDismissible: dto.dismissible,
    displayFrequency: dto.displayFrequency,
    isDraft: dto.draft,
    status: dto.status,
    startAtLabel: formatDateAr(dto.startAt),
    endAtLabel: formatDateAr(dto.endAt),
    updatedAtLabel: formatDateAr(dto.updatedAt ?? dto.createdAt),
  };
}

/** A blank editor: today, running for a week, dismissible, shown every visit. */
export function createEmptyBannerForm(): BannerFormState {
  const today = new Date();
  return {
    internalName: "",
    title: "",
    description: "",
    imageUrl: "",
    callToActionLabel: "",
    callToActionUrl: "",
    startDate: formatDateInput(today),
    startTime: formatTimeInput(today),
    endDate: formatDateInput(addDays(today, 7)),
    endTime: "23:59",
    timezone: DEFAULT_TIMEZONE,
    priority: DEFAULT_FORM_PRIORITY,
    isEnabled: true,
    isDismissible: true,
    displayFrequency: "EVERY_VISIT",
  };
}

/**
 * An existing banner, split back into the two inputs the editor holds each instant in.
 *
 * A banner with an open window opens the editor on today and a week out — the same defaults
 * a new one gets, because those are the two fields the owner is about to fill in.
 *
 * The stored position deliberately does not come along. The editor has no control for it —
 * position is expressed by dragging rows in the list — so carrying it in would let a value
 * the owner cannot see fail a validation they cannot fix. The real position travels
 * separately, through `toBannerRequest`'s `existingPriority`.
 */
export function toBannerForm(banner: InstructorBanner): BannerFormState {
  const start = banner.startAt ? new Date(banner.startAt) : new Date();
  const end = banner.endAt ? new Date(banner.endAt) : addDays(new Date(), 7);
  return {
    internalName: banner.internalName,
    title: banner.title,
    description: banner.description ?? "",
    imageUrl: banner.imageUrl ?? "",
    callToActionLabel: banner.callToActionLabel ?? "",
    callToActionUrl: banner.callToActionUrl ?? "",
    startDate: formatDateInput(start),
    startTime: formatTimeInput(start),
    endDate: formatDateInput(end),
    endTime: formatTimeInput(end),
    timezone: banner.timezone,
    priority: DEFAULT_FORM_PRIORITY,
    isEnabled: banner.isEnabled,
    isDismissible: banner.isDismissible,
    displayFrequency: banner.displayFrequency,
  };
}

/**
 * The editor's state as the request that saves it.
 *
 * The action is what decides the window's start and the draft flag: "publish now" starts the
 * banner at this instant whatever the start field says, "schedule" honours the field, and
 * "save as draft" keeps it out of delivery regardless.
 *
 * `priority` is deliberately absent on create — the form has no field for a position, and the
 * backend appends new banners to the end of the owner's list.
 */
export function toBannerRequest(
  form: BannerFormState,
  action: BannerSaveAction,
  existingPriority?: number,
): BannerRequest {
  const isDraft = action === "draft";
  return {
    internalName: form.internalName.trim(),
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    imageUrl: form.imageUrl.trim() || undefined,
    callToActionLabel: form.callToActionLabel.trim() || undefined,
    callToActionUrl: form.callToActionUrl.trim() || undefined,
    startAt: action === "publish" ? nowAsLocalDateTime() : toLocalDateTime(form.startDate, form.startTime),
    endAt: toLocalDateTime(form.endDate, form.endTime),
    timezone: form.timezone,
    priority: existingPriority,
    enabled: isDraft ? false : form.isEnabled,
    dismissible: form.isDismissible,
    displayFrequency: form.displayFrequency,
    draft: isDraft,
  };
}

/**
 * A banner as the request that recreates it, for the list's duplicate and toggle actions.
 *
 * Duplicating produces an unpublished copy the owner can edit before it goes anywhere;
 * toggling rewrites the same banner with one flag moved, and leaves draft behind because
 * switching a draft on is what publishing it from the list means.
 */
export function toBannerRequestFromBanner(
  banner: InstructorBanner,
  overrides: Partial<Pick<BannerRequest, "internalName" | "enabled" | "draft">> = {},
): BannerRequest {
  return {
    internalName: banner.internalName,
    title: banner.title,
    description: banner.description,
    imageUrl: banner.imageUrl,
    callToActionLabel: banner.callToActionLabel,
    callToActionUrl: banner.callToActionUrl,
    startAt: banner.startAt,
    endAt: banner.endAt,
    timezone: banner.timezone,
    priority: banner.priority,
    enabled: banner.isEnabled,
    dismissible: banner.isDismissible,
    displayFrequency: banner.displayFrequency,
    draft: banner.isDraft,
    ...overrides,
  };
}

export function toDuplicateRequest(banner: InstructorBanner): BannerRequest {
  const request = toBannerRequestFromBanner(banner, {
    internalName: toDuplicateName(banner.internalName),
    enabled: false,
    draft: true,
  });
  // A copy joins the end of the list rather than sharing the original's position.
  return { ...request, priority: undefined };
}

export function toToggleRequest(banner: InstructorBanner): BannerRequest {
  return toBannerRequestFromBanner(banner, { enabled: !banner.isEnabled, draft: false });
}
