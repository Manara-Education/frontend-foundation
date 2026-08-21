import { unwrapList } from "@/shared/api";
import * as api from "../api/banner-carousel.api";
import { toStudentBanner } from "../mappers/banner-carousel.mapper";
import type { StudentBanner } from "../types/banner-carousel.types";

const SESSION_DISMISSED_KEY = "manara:dismissed_banners";

/**
 * Banner delivery for the learner's home screen.
 *
 * Dismissal is split by what it has to survive, which is the display frequency's whole
 * meaning. `ONCE_PER_STUDENT` promises a learner sees the banner once — not once per
 * browser — so it goes to the server. The other two are scoped to a visit by definition, and
 * `sessionStorage` is exactly that scope: it is the source of truth for nothing, only a note
 * that this tab has already shown one.
 */
export const bannerCarouselService = {
  async loadActiveBanners(): Promise<StudentBanner[]> {
    return unwrapList(await api.getActiveBannersRequest()).map(toStudentBanner);
  },

  /**
   * Persists the dismissal where its frequency says it belongs.
   *
   * A failed server call is swallowed: the learner asked for the banner to go away, it has,
   * and turning "we could not write that down" into an error message would be a worse
   * outcome than the banner reappearing on their next visit.
   */
  async dismissBanner(banner: StudentBanner): Promise<void> {
    if (banner.displayFrequency === "ONCE_PER_STUDENT") {
      try {
        await api.dismissBannerRequest(banner.id);
      } catch (err) {
        console.error("Failed to record banner dismissal", err);
      }
      return;
    }
    rememberForSession(banner.id);
  },

  /** Ids this tab has already had closed. Empty whenever storage is unavailable. */
  getSessionDismissedIds(): number[] {
    try {
      const raw = sessionStorage.getItem(SESSION_DISMISSED_KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  },
};

function rememberForSession(bannerId: number): void {
  try {
    const ids = bannerCarouselService.getSessionDismissedIds();
    if (!ids.includes(bannerId)) {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, JSON.stringify([...ids, bannerId]));
    }
  } catch {
    // A browser with storage disabled simply shows the banner again next visit.
  }
}
