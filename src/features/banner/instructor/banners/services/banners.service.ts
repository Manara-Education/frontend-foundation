import { unwrap, unwrapList } from "@/shared/api";
import * as api from "../api/banners.api";
import {
  toBannerRequest,
  toDuplicateRequest,
  toInstructorBanner,
  toToggleRequest,
} from "../mappers/banners.mapper";
import type {
  BannerFormState,
  BannerSaveAction,
  InstructorBanner,
} from "../types/banners.types";

/**
 * Orchestrates the banner endpoints for the management screen.
 *
 * Every write answers with the saved banner and every read with the list, so the screen
 * never has to guess what the server made of what it sent — the position a new banner was
 * given and the status its dates now imply both come back from the same call.
 */
export const bannersService = {
  async loadBanners(): Promise<InstructorBanner[]> {
    return unwrapList(await api.getMyBannersRequest()).map(toInstructorBanner);
  },

  async loadBanner(bannerId: number): Promise<InstructorBanner> {
    return toInstructorBanner(unwrap(await api.getBannerRequest(bannerId)));
  },

  async createBanner(form: BannerFormState, action: BannerSaveAction): Promise<InstructorBanner> {
    const response = await api.createBannerRequest(toBannerRequest(form, action));
    return toInstructorBanner(unwrap(response));
  },

  /** The banner's position is preserved: the editor has no field that could change it. */
  async updateBanner(
    banner: InstructorBanner,
    form: BannerFormState,
    action: BannerSaveAction,
  ): Promise<InstructorBanner> {
    const response = await api.updateBannerRequest(
      banner.id,
      toBannerRequest(form, action, banner.priority),
    );
    return toInstructorBanner(unwrap(response));
  },

  /** An unpublished copy, appended to the end of the list for the owner to edit. */
  async duplicateBanner(banner: InstructorBanner): Promise<InstructorBanner> {
    const response = await api.createBannerRequest(toDuplicateRequest(banner));
    return toInstructorBanner(unwrap(response));
  },

  /** Switching a banner on from the list also publishes it — a draft is not shown either way. */
  async toggleBanner(banner: InstructorBanner): Promise<InstructorBanner> {
    const response = await api.updateBannerRequest(banner.id, toToggleRequest(banner));
    return toInstructorBanner(unwrap(response));
  },

  async deleteBanner(bannerId: number): Promise<void> {
    await api.deleteBannerRequest(bannerId);
  },

  /** Answers with the whole reordered list, positions rewritten. */
  async reorderBanners(bannerIds: number[]): Promise<InstructorBanner[]> {
    const response = await api.reorderBannersRequest({ bannerIds });
    return unwrapList(response).map(toInstructorBanner);
  },

  async uploadBannerImage(file: File): Promise<string> {
    return unwrap(await api.uploadBannerImageRequest(file)).url;
  },
};
