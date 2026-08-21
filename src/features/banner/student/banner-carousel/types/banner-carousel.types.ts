import type { BannerDisplayFrequency } from "@/features/banner/types/banner.types";

/**
 * Raw API DTO — mirrors `StudentBannerResponse`.
 *
 * Deliberately narrow: it carries what the carousel draws and the two flags that decide how
 * it behaves, and none of the owner's scheduling or filing.
 */
export interface StudentBannerResponse {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  callToActionLabel?: string | null;
  callToActionUrl?: string | null;
  dismissible: boolean;
  displayFrequency: BannerDisplayFrequency;
}

/** Domain/view shape the carousel renders. */
export interface StudentBanner {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  callToActionLabel?: string;
  callToActionUrl?: string;
  isDismissible: boolean;
  displayFrequency: BannerDisplayFrequency;
}
