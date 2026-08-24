import type { BannerDisplayFrequency, BannerStatus } from "@/features/banner/types/banner.types";

/** Raw API DTO — mirrors `BannerResponse` on the backend exactly. */
export interface BannerResponse {
  id: number;
  internalName: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  callToActionLabel?: string | null;
  callToActionUrl?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  timezone: string;
  priority: number;
  enabled: boolean;
  dismissible: boolean;
  displayFrequency: BannerDisplayFrequency;
  draft: boolean;
  status: BannerStatus;
  createdAt: string;
  updatedAt?: string | null;
}

/** Raw API DTO — mirrors `BannerRequest`. Semantics are full replacement on create and update. */
export interface BannerRequest {
  internalName: string;
  title: string;
  description?: string;
  imageUrl?: string;
  callToActionLabel?: string;
  callToActionUrl?: string;
  startAt?: string;
  endAt?: string;
  timezone: string;
  priority?: number;
  enabled: boolean;
  dismissible: boolean;
  displayFrequency: BannerDisplayFrequency;
  draft: boolean;
}

export interface BannerOrderRequest {
  bannerIds: number[];
}

/**
 * Domain/view shape the list renders.
 *
 * `status` comes from the server rather than being recomputed here: it is the same answer
 * that decides whether learners are being shown the banner, so a row cannot read "active"
 * while delivery disagrees. The three `…Label` fields are the formatted dates the row prints.
 */
export interface InstructorBanner {
  id: number;
  internalName: string;
  title: string;
  description?: string;
  imageUrl?: string;
  callToActionLabel?: string;
  callToActionUrl?: string;
  startAt?: string;
  endAt?: string;
  timezone: string;
  priority: number;
  isEnabled: boolean;
  isDismissible: boolean;
  displayFrequency: BannerDisplayFrequency;
  isDraft: boolean;
  status: BannerStatus;
  startAtLabel: string;
  endAtLabel: string;
  updatedAtLabel: string;
}

/** Everything the editor holds while a banner is being written. */
export interface BannerFormState {
  internalName: string;
  title: string;
  description: string;
  imageUrl: string;
  callToActionLabel: string;
  callToActionUrl: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  priority: number;
  isEnabled: boolean;
  isDismissible: boolean;
  displayFrequency: BannerDisplayFrequency;
}

export interface BannerFormErrors {
  internalName?: string;
  title?: string;
  imageUrl?: string;
  callToActionUrl?: string;
  startDate?: string;
  endDate?: string;
  priority?: string;
  general?: string;
}

/** Which of the three buttons at the foot of the editor was pressed. */
export type BannerSaveAction = "draft" | "schedule" | "publish";

