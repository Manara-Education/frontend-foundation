import type {
  StudentBanner,
  StudentBannerResponse,
} from "../types/banner-carousel.types";

export function toStudentBanner(dto: StudentBannerResponse): StudentBanner {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? undefined,
    imageUrl: dto.imageUrl ?? undefined,
    callToActionLabel: dto.callToActionLabel ?? undefined,
    callToActionUrl: dto.callToActionUrl ?? undefined,
    isDismissible: dto.dismissible,
    displayFrequency: dto.displayFrequency,
  };
}
